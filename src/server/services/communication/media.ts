import type { PrismaClient } from '@prisma/client';
import { getStorageAdapter } from '../storage';
import { getMasterKey, wrapKeyWithMaster, unwrapKeyWithMaster, encryptMedia, tryDecryptMedia } from '../security/crypto';
import { requireTelegramMiniAppIdentity } from './telegram-mini-app';

export type Visibility = 'private' | 'squad' | 'public';

export interface UploadTelegramMediaInput {
  token: string;
  title?: string;
  mimeType: string; // e.g. 'image/jpeg'
  dataBase64: string; // raw base64 without data URL prefix
  visibility?: Visibility;
  thumbBase64?: string; // optional thumbnail base64
  thumbMimeType?: string; // e.g. 'image/jpeg'
}

function extensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  return map[mime] || 'bin';
}

export async function uploadTelegramMiniAppMedia(
  prisma: PrismaClient,
  input: UploadTelegramMediaInput,
) {
  const identity = await requireTelegramMiniAppIdentity(prisma, input.token);
  const memberships = identity.user.squads;
  if (memberships.length === 0) {
    throw new Error("You need to join a squad first.");
  }
  const squadId = identity.activeSquadId || memberships[0].squad.id;

  // Ensure per-squad encryption key exists
  const master = getMasterKey();
  let secret = await prisma.squadSecret.findUnique({ where: { squadId_kind: { squadId, kind: 'media_enc' } } });
  if (!secret) {
    const mediaKey = cryptoRandom(32);
    const keyEnc = wrapKeyWithMaster(mediaKey, master);
    secret = await prisma.squadSecret.create({ data: { squadId, kind: 'media_enc', keyEnc } });
  }
  const mediaKey = unwrapKeyWithMaster(secret.keyEnc, master);

  const media = await prisma.squadMedia.create({
    data: {
      squadId,
      uploaderId: identity.user.id,
      title: input.title?.trim() || null,
      kind: input.mimeType.startsWith('video/') ? 'video' : 'image',
      mimeType: input.mimeType,
      size: 0, // updated after storage
      storageKey: 'pending',
      visibility: input.visibility || 'squad',
    },
  });

  const ext = extensionFromMime(input.mimeType);
  const storage = getStorageAdapter();
  // Encrypt on server before storing (ciphertext at rest). Enforce size guard.
  const plainBuffer = Buffer.from(input.dataBase64, 'base64');
  const MAX_BYTES = 25 * 1024 * 1024; // 25MB
  if (plainBuffer.length > MAX_BYTES) {
    throw new Error('FILE_TOO_LARGE:Maximum file size is 25MB');
  }
  const encryptedBuffer = encryptMedia(plainBuffer, mediaKey);
  // Optional per-squad quota (sum of original sizes)
  const quotaMb = Number(process.env.MEDIA_SQUAD_QUOTA_MB || '0');
  if (quotaMb > 0) {
    const agg = await prisma.squadMedia.aggregate({
      _sum: { size: true },
      where: { squadId, deletedAt: null },
    });
    const used = agg._sum.size || 0;
    const next = used + plainBuffer.length;
    if (next > quotaMb * 1024 * 1024) {
      throw new Error('QUOTA_EXCEEDED:Squad media quota exceeded');
    }
  }
  const stored = await storage.saveBase64({
    base64Data: encryptedBuffer.toString('base64'),
    squadId,
    mediaId: media.id,
    extension: ext,
    mimeType: 'application/octet-stream',
  });

  let thumbUpdate: any = {};
  if (input.thumbBase64 && input.thumbMimeType) {
    const tPlain = Buffer.from(input.thumbBase64, 'base64');
    // Keep thumb <= 500KB for snappy loads
    if (tPlain.length > 512 * 1024) {
      throw new Error('THUMB_TOO_LARGE:Thumbnail exceeds 512KB');
    }
    const tEncrypted = encryptMedia(tPlain, mediaKey);
    const tExt = extensionFromMime(input.thumbMimeType);
    const tStored = await storage.saveBase64({
      base64Data: tEncrypted.toString('base64'),
      squadId,
      mediaId: `${media.id}_thumb`,
      extension: tExt,
      mimeType: 'application/octet-stream',
    });
    thumbUpdate = {
      thumbStorageKey: tStored.key,
      thumbMimeType: input.thumbMimeType,
      thumbSize: tStored.size,
    };
  }

  await prisma.squadMedia.update({
    where: { id: media.id },
    data: { storageKey: stored.key, size: stored.size, ...thumbUpdate },
  });

  return { id: media.id };
}

export async function listTelegramMiniAppMedia(
  prisma: PrismaClient,
  token: string,
) {
  const identity = await requireTelegramMiniAppIdentity(prisma, token);
  const memberships = identity.user.squads;
  if (memberships.length === 0) {
    throw new Error("You need to join a squad first.");
  }
  const squadId = identity.activeSquadId || memberships[0].squad.id;

  const items = await prisma.squadMedia.findMany({
    where: { squadId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      title: true,
      kind: true,
      mimeType: true,
      size: true,
      visibility: true,
      createdAt: true,
      thumbStorageKey: true,
      uploader: { select: { id: true, name: true } },
    },
  });

  return items
    .filter(i => (i as any).deletedAt == null)
    .map(i => ({ ...i, hasThumb: Boolean(i.thumbStorageKey) }));
}

export async function readTelegramMiniAppMedia(
  prisma: PrismaClient,
  input: { token: string; mediaId: string },
) {
  const identity = await requireTelegramMiniAppIdentity(prisma, input.token);
  const media = await prisma.squadMedia.findUnique({ where: { id: input.mediaId } });
  if (!media) throw new Error('MEDIA_NOT_FOUND');
  if (media.deletedAt) throw new Error('MEDIA_NOT_FOUND');

  const memberships = identity.user.squads;
  const squadId = identity.activeSquadId || memberships[0]?.squad.id || null;
  if (!squadId || media.squadId !== squadId) throw new Error('FORBIDDEN');

  if (media.visibility === 'private' && media.uploaderId !== identity.user.id) {
    throw new Error('FORBIDDEN');
  }

  // Decrypt using squad key (backward compatible if not encrypted)
  const master = getMasterKey();
  const secret = await prisma.squadSecret.findUnique({ where: { squadId_kind: { squadId: media.squadId, kind: 'media_enc' } } });
  const storage = getStorageAdapter();
  const storedBuffer = await storage.readByKey(media.storageKey);
  const key = secret ? unwrapKeyWithMaster(secret.keyEnc, master) : cryptoRandom(32);
  const buffer = tryDecryptMedia(storedBuffer, key);
  return { mimeType: media.mimeType, buffer };
}

export async function readTelegramMiniAppMediaThumb(
  prisma: PrismaClient,
  input: { token: string; mediaId: string },
) {
  const identity = await requireTelegramMiniAppIdentity(prisma, input.token);
  const media = await prisma.squadMedia.findUnique({ where: { id: input.mediaId } });
  if (!media) throw new Error('MEDIA_NOT_FOUND');

  const memberships = identity.user.squads;
  const squadId = identity.activeSquadId || memberships[0]?.squad.id || null;
  if (!squadId || media.squadId !== squadId) throw new Error('FORBIDDEN');
  if (media.visibility === 'private' && media.uploaderId !== identity.user.id) {
    throw new Error('FORBIDDEN');
  }
  if (!media.thumbStorageKey || !media.thumbMimeType || media.deletedAt) {
    throw new Error('NO_THUMB');
  }

  const master = getMasterKey();
  const secret = await prisma.squadSecret.findUnique({ where: { squadId_kind: { squadId: media.squadId, kind: 'media_enc' } } });
  const storage = getStorageAdapter();
  const storedBuffer = await storage.readByKey(media.thumbStorageKey);
  const key = secret ? unwrapKeyWithMaster(secret.keyEnc, master) : cryptoRandom(32);
  const buffer = tryDecryptMedia(storedBuffer, key);
  return { mimeType: media.thumbMimeType, buffer } as { mimeType: string; buffer: Buffer };
}

function cryptoRandom(n: number): Buffer {
  const nodeCrypto = require('crypto') as typeof import('crypto');
  return nodeCrypto.randomBytes(n);
}
