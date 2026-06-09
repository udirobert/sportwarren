/**
 * Image service — avatar upload, variant generation, and key resolution.
 *
 * Avatars are stored as the original (`main`) plus three resized variants
 * generated via sharp:
 *   - `square` (256×256, cover) — profile thumbnails
 *   - `thumb`  (64×64, cover)  — member lists, comments
 *   - `wide`   (512×288, cover) — card banners
 *
 * Key resolution:
 *   - Local keys (`players/.../avatar/main.png`) → served by the public
 *     route at `/api/storage/[...key]`.
 *   - IPFS keys (`ipfs/<cid>`) → served by the configured gateway URL.
 *
 * The lookup is pure: no DB, no network, deterministic.
 */

import sharp from 'sharp';
import { prisma } from '@/lib/db';
import { getStorageAdapter } from '../storage';
import type { SaveBase64Opts } from '../storage/types';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

const EXTENSION_FOR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export type AvatarVariant = 'main' | 'square' | 'thumb' | 'wide';

interface VariantSpec {
  id: AvatarVariant;
  width: number;
  height: number;
}

const AVATAR_VARIANTS: VariantSpec[] = [
  { id: 'square', width: 256, height: 256 },
  { id: 'thumb', width: 64, height: 64 },
  { id: 'wide', width: 512, height: 288 },
];

export interface UploadAvatarInput {
  ownerType: 'player' | 'squad';
  ownerId: string;
  base64: string;
  mimeType: string;
}

export interface UploadAvatarResult {
  key: string;
  size: number;
  variants: Record<AvatarVariant, string | null>;
}

class ImageServiceImpl {
  async uploadAvatar(input: UploadAvatarInput): Promise<UploadAvatarResult> {
    if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new Error(`UNSUPPORTED_MIME:${input.mimeType}`);
    }
    const buffer = Buffer.from(input.base64, 'base64');
    if (buffer.length > MAX_BYTES) {
      throw new Error('AVATAR_TOO_LARGE:Maximum avatar size is 8MB');
    }
    const ext = EXTENSION_FOR_MIME[input.mimeType];
    const adapter = getStorageAdapter();

    const mainOpts: SaveBase64Opts = {
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      kind: 'avatar',
      variantId: 'main',
      base64Data: input.base64,
      extension: ext,
      mimeType: input.mimeType,
    };
    const stored = await adapter.saveBase64(mainOpts);

    const variants: Record<AvatarVariant, string | null> = {
      main: stored.key,
      square: null,
      thumb: null,
      wide: null,
    };

    const image = sharp(buffer);
    const format = input.mimeType === 'image/webp' ? 'webp' : input.mimeType === 'image/png' ? 'png' : 'jpeg';

    for (const spec of AVATAR_VARIANTS) {
      try {
        const resized = await image
          .resize(spec.width, spec.height, { fit: 'cover' })[format]({ quality: 85 })
          .toBuffer();

        const variantBase64 = resized.toString('base64');
        const variantOpts: SaveBase64Opts = {
          ownerType: input.ownerType,
          ownerId: input.ownerId,
          kind: 'avatar',
          variantId: spec.id,
          base64Data: variantBase64,
          extension: ext,
          mimeType: input.mimeType,
        };
        const result = await adapter.saveBase64(variantOpts);
        variants[spec.id] = result.key;
      } catch (e) {
        console.warn(`[ImageService] Failed to generate ${spec.id} variant:`, e);
      }
    }

    if (input.ownerType === 'player') {
      await prisma.user.update({
        where: { id: input.ownerId },
        data: { avatar: stored.key },
      });
    }

    return { key: stored.key, size: stored.size, variants };
  }

  resolveUrl(key: string | null | undefined): string | null {
    if (!key) return null;
    if (key.startsWith('ipfs/')) {
      const cid = key.slice('ipfs/'.length);
      const gateway = (process.env.IPFS_GATEWAY_READ_URL || '').trim().replace(/\/$/, '');
      if (!gateway) return null;
      return `${gateway}/${cid}`;
    }
    return `/api/storage/${key}`;
  }

  /**
   * Derive a variant URL from the main avatar key.
   * E.g. `players/abc/avatar/main.jpg` → `players/abc/avatar/square.jpg`
   */
  resolveVariantUrl(mainKey: string | null | undefined, variant: AvatarVariant): string | null {
    if (!mainKey) return null;
    if (variant === 'main') return this.resolveUrl(mainKey);
    const variantKey = mainKey.replace(/\/main(\.\w+)$/, `/${variant}$1`);
    return this.resolveUrl(variantKey);
  }
}

export const imageService = new ImageServiceImpl();
export type { ImageServiceImpl as ImageService };
