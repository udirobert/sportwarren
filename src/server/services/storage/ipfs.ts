import type { StoredObject } from './types';

function cfg() {
  const uploadUrl = (process.env.IPFS_GATEWAY_UPLOAD_URL || '').trim();
  const readUrl = (process.env.IPFS_GATEWAY_READ_URL || '').trim();
  const apiKey = (process.env.IPFS_GATEWAY_API_KEY || '').trim();
  if (!uploadUrl || !readUrl) {
    throw new Error('IPFS storage is not configured');
  }
  return { uploadUrl, readUrl, apiKey };
}

export async function saveBase64ToIpfs(opts: {
  base64Data: string;
  squadId: string;
  mediaId: string;
  extension: string;
  mimeType: string;
}): Promise<StoredObject> {
  const { uploadUrl, apiKey } = cfg();
  const blob = Buffer.from(opts.base64Data, 'base64');

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': opts.mimeType,
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      'X-Squad-Id': opts.squadId,
      'X-Media-Id': opts.mediaId,
    },
    body: blob,
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || !data?.cid) {
    throw new Error(data?.error || 'Failed to upload to IPFS');
  }
  const key = `ipfs/${data.cid}`;
  return { key, size: blob.length };
}

export async function readIpfsByKey(key: string): Promise<Buffer> {
  const { readUrl, apiKey } = cfg();
  const cid = key.replace(/^ipfs\//, '');
  const url = `${readUrl.replace(/\/$/, '')}/${cid}`;
  const res = await fetch(url, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
  });
  if (!res.ok) throw new Error('Failed to read from IPFS');
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

