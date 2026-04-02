import crypto from 'crypto';
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

// Simple envelope: magic | iv (12) | authTag (16) | ciphertext
const MAGIC = Buffer.from('SWENC1');

let cachedMasterKey: Buffer | null = null;

/**
 * Returns the 32-byte media master key.
 *
 * Production: KMS_KEY_ID + MEDIA_KEY_CIPHERTEXT (base64 KMS ciphertext blob).
 *   The plaintext key never lives in an env var.
 *
 * Local dev fallback: MEDIA_MASTER_KEY (raw 32-byte base64) — same as before.
 */
export async function getMasterKey(): Promise<Buffer> {
  if (cachedMasterKey) return cachedMasterKey;

  const ciphertext = process.env.MEDIA_KEY_CIPHERTEXT;
  const keyId = process.env.KMS_KEY_ID;

  if (ciphertext && keyId) {
    const kms = new KMSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    const { Plaintext } = await kms.send(new DecryptCommand({
      KeyId: keyId,
      CiphertextBlob: Buffer.from(ciphertext, 'base64'),
    }));
    if (!Plaintext || Plaintext.length !== 32) {
      throw new Error('KMS decrypted key must be 32 bytes');
    }
    cachedMasterKey = Buffer.from(Plaintext);
    return cachedMasterKey;
  }

  // Local dev fallback
  const b64 = (process.env.MEDIA_MASTER_KEY || '').trim();
  if (!b64) throw new Error('Set MEDIA_KEY_CIPHERTEXT + KMS_KEY_ID (prod) or MEDIA_MASTER_KEY (dev)');
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('MEDIA_MASTER_KEY must be 32 bytes base64');
  cachedMasterKey = key;
  return cachedMasterKey;
}

export function wrapKeyWithMaster(plainKey: Buffer, master: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', master, iv);
  const ciphertext = Buffer.concat([cipher.update(plainKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function unwrapKeyWithMaster(encB64: string, master: Buffer): Buffer {
  const buf = Buffer.from(encB64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', master, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function encryptMedia(content: Buffer, key: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(content), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, iv, tag, ciphertext]);
}

export function tryDecryptMedia(enveloped: Buffer, key: Buffer): Buffer {
  if (enveloped.length < MAGIC.length + 12 + 16 || !enveloped.subarray(0, MAGIC.length).equals(MAGIC)) {
    return enveloped; // backward compat: plaintext
  }
  const iv = enveloped.subarray(MAGIC.length, MAGIC.length + 12);
  const tag = enveloped.subarray(MAGIC.length + 12, MAGIC.length + 12 + 16);
  const ciphertext = enveloped.subarray(MAGIC.length + 12 + 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
