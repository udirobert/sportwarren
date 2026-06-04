/**
 * Image service — avatar upload + key resolution.
 *
 * PR 2 stores the original avatar under `players/<profileId>/avatar/main.<ext>`.
 * Variant generation (square / wide / tall / thumb) lands in PR 4 with the
 * identity card, which is the first surface that actually consumes multiple
 * sizes. For now we keep the storage contract simple: one file, one key.
 *
 * Key resolution:
 *   - Local keys (`players/.../avatar/main.png`) → served by the public
 *     route at `/api/storage/[...key]`.
 *   - IPFS keys (`ipfs/<cid>`) → served by the configured gateway URL.
 *
 * The lookup is pure: no DB, no network, deterministic.
 */

import { prisma } from '@/lib/db';
import { getStorageAdapter } from '../storage';
import type { SaveBase64Opts } from '../storage/types';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

const EXTENSION_FOR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export interface UploadAvatarInput {
  ownerType: 'player' | 'squad';
  ownerId: string;
  base64: string;
  mimeType: string;
}

export interface UploadAvatarResult {
  key: string;
  size: number;
}

class ImageServiceImpl {
  /**
   * Store an avatar and write the storage key to the owner row.
   * For players this is `User.avatar`. Squads don't have an avatar field
   * yet (PR 4 adds it with the identity card); PR 2 stores the key on
   * User regardless.
   */
  async uploadAvatar(input: UploadAvatarInput): Promise<UploadAvatarResult> {
    if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new Error(`UNSUPPORTED_MIME:${input.mimeType}`);
    }
    const buffer = Buffer.from(input.base64, 'base64');
    if (buffer.length > MAX_BYTES) {
      throw new Error('AVATAR_TOO_LARGE:Maximum avatar size is 8MB');
    }
    const ext = EXTENSION_FOR_MIME[input.mimeType];

    const opts: SaveBase64Opts = {
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      kind: 'avatar',
      variantId: 'main',
      base64Data: input.base64,
      extension: ext,
      mimeType: input.mimeType,
    };

    const stored = await getStorageAdapter().saveBase64(opts);

    // Persist the key. Players own the avatar on User; squads will in PR 4.
    if (input.ownerType === 'player') {
      await prisma.user.update({
        where: { id: input.ownerId },
        data: { avatar: stored.key },
      });
    }

    return { key: stored.key, size: stored.size };
  }

  /**
   * Resolve a storage key to a public URL.
   *   - IPFS keys: <gateway-read-url>/<cid>
   *   - Local keys: /api/storage/<key>
   * Returns null if the key is unrecognised.
   */
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
}

export const imageService = new ImageServiceImpl();
export type { ImageServiceImpl as ImageService };
