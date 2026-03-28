import crypto from 'crypto';

// Simple envelope: magic | iv (12) | authTag (16) | ciphertext
const MAGIC = Buffer.from('SWENC1');

export function getMasterKey(): Buffer {
  const b64 = (process.env.MEDIA_MASTER_KEY || '').trim();
  if (!b64) throw new Error('MEDIA_MASTER_KEY is required for media encryption');
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('MEDIA_MASTER_KEY must be 32 bytes base64');
  return key;
}

export function wrapKeyWithMaster(plainKey: Buffer, master: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', master, iv);
  const ciphertext = Buffer.concat([cipher.update(plainKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  const envelope = Buffer.concat([iv, tag, ciphertext]);
  return envelope.toString('base64');
}

export function unwrapKeyWithMaster(encB64: string, master: Buffer): Buffer {
  const buf = Buffer.from(encB64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', master, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain;
}

export function encryptMedia(content: Buffer, key: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(content), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, iv, tag, ciphertext]);
}

export function tryDecryptMedia(enveloped: Buffer, key: Buffer): Buffer {
  // Backward compatibility: if MAGIC missing, treat as plaintext
  if (enveloped.length < MAGIC.length + 12 + 16 || !enveloped.subarray(0, MAGIC.length).equals(MAGIC)) {
    return enveloped;
  }
  const iv = enveloped.subarray(MAGIC.length, MAGIC.length + 12);
  const tag = enveloped.subarray(MAGIC.length + 12, MAGIC.length + 12 + 16);
  const ciphertext = enveloped.subarray(MAGIC.length + 12 + 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

