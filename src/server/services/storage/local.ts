import { promises as fs } from 'fs';
import path from 'path';
import type { SaveBase64Opts, StoredObject } from './types';

const DEFAULT_STORAGE_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), 'storage');

function storageRoot() {
  return process.env.STORAGE_ROOT?.trim() || DEFAULT_STORAGE_ROOT;
}

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

function pathForOwner(opts: SaveBase64Opts): { dir: string; fileName: string } {
  const root = storageRoot();
  const ownerSegment = opts.ownerType === 'player' ? 'players' : 'squads';
  switch (opts.kind) {
    case 'avatar': {
      const variant = opts.variantId ?? 'main';
      return { dir: path.join(root, ownerSegment, opts.ownerId, 'avatar'), fileName: `${variant}.${opts.extension}` };
    }
    case 'badge': {
      const variant = opts.variantId ?? 'main';
      return { dir: path.join(root, ownerSegment, opts.ownerId, 'badge'), fileName: `${variant}.${opts.extension}` };
    }
    case 'media': {
      if (!opts.mediaId) throw new Error('mediaId is required for storage kind=media');
      return { dir: path.join(root, ownerSegment, opts.ownerId, 'media'), fileName: `${opts.mediaId}.${opts.extension}` };
    }
    case 'moment-render': {
      if (!opts.momentId) throw new Error('momentId is required for storage kind=moment-render');
      return { dir: path.join(root, 'moments', opts.ownerType, opts.ownerId), fileName: `${opts.momentId}.${opts.extension}` };
    }
  }
}

export async function saveBase64ToLocal(opts: SaveBase64Opts): Promise<StoredObject & { absolutePath: string }> {
  const { dir, fileName } = pathForOwner(opts);
  await ensureDir(dir);
  const absolutePath = path.join(dir, fileName);
  const buffer = Buffer.from(opts.base64Data, 'base64');
  await fs.writeFile(absolutePath, buffer);
  const key = path.posix.join(path.relative(storageRoot(), dir), fileName).split(path.sep).join(path.posix.sep);
  return { key, size: buffer.length, absolutePath };
}

export async function readLocalByKey(key: string): Promise<Buffer> {
  const root = storageRoot();
  const absolutePath = path.join(root, key);
  return fs.readFile(absolutePath);
}

export async function removeLocalByKey(key: string): Promise<void> {
  const root = storageRoot();
  const absolutePath = path.join(root, key);
  try {
    await fs.unlink(absolutePath);
  } catch (e: any) {
    if (e && e.code === 'ENOENT') return;
    throw e;
  }
}
