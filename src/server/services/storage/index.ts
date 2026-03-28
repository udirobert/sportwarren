import type { StorageAdapter, StoredObject } from './types';
import { saveBase64ToLocal, readLocalByKey, removeLocalByKey } from './local';
import { saveBase64ToIpfs, readIpfsByKey } from './ipfs';

const MODE = (process.env.MEDIA_STORAGE || 'local').trim().toLowerCase();

class LocalAdapter implements StorageAdapter {
  async saveBase64(opts: { base64Data: string; squadId: string; mediaId: string; extension: string; mimeType: string }): Promise<StoredObject> {
    const saved = await saveBase64ToLocal({
      base64Data: opts.base64Data,
      squadId: opts.squadId,
      mediaId: opts.mediaId,
      extension: opts.extension,
    });
    return { key: saved.key, size: saved.size };
  }
  readByKey(key: string): Promise<Buffer> {
    return readLocalByKey(key);
  }
  async removeByKey(key: string): Promise<void> {
    await removeLocalByKey(key);
  }
}

class IpfsAdapter implements StorageAdapter {
  saveBase64(opts: { base64Data: string; squadId: string; mediaId: string; extension: string; mimeType: string }): Promise<StoredObject> {
    return saveBase64ToIpfs(opts);
  }
  readByKey(key: string): Promise<Buffer> {
    return readIpfsByKey(key);
  }
  async removeByKey(_key: string): Promise<void> {
    // No-op by default; depends on pinning setup
  }
}

let adapter: StorageAdapter = new LocalAdapter();
if (MODE === 'ipfs') {
  adapter = new IpfsAdapter();
}

export function getStorageAdapter(): StorageAdapter {
  return adapter;
}
