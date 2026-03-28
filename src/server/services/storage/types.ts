export interface StoredObject {
  key: string; // opaque key (path or CID)
  size: number;
}

export interface StorageAdapter {
  saveBase64(opts: { base64Data: string; squadId: string; mediaId: string; extension: string; mimeType: string }): Promise<StoredObject>;
  readByKey(key: string): Promise<Buffer>;
  removeByKey?(key: string): Promise<void>;
}
