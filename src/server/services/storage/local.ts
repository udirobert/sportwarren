import { promises as fs } from 'fs';
import path from 'path';

export interface StoredObject {
  key: string; // opaque storage key
  size: number;
  absolutePath: string;
}

function storageRoot() {
  return process.env.STORAGE_ROOT?.trim() || path.join(process.cwd(), 'storage');
}

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function saveBase64ToLocal(
  opts: {
    base64Data: string;
    squadId: string;
    mediaId: string;
    extension: string; // e.g., 'jpg'
  }
): Promise<StoredObject> {
  const root = storageRoot();
  const dir = path.join(root, 'squads', opts.squadId);
  await ensureDir(dir);

  const fileName = `${opts.mediaId}.${opts.extension}`;
  const absolutePath = path.join(dir, fileName);
  const key = path.posix.join('squads', opts.squadId, fileName);

  const buffer = Buffer.from(opts.base64Data, 'base64');
  await fs.writeFile(absolutePath, buffer);

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
    if (e && e.code === 'ENOENT') return; // already gone
    throw e;
  }
}
