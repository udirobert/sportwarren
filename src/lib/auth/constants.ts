export const SIGNATURE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const AUTH_STORAGE_KEYS = {
  SIGNATURE: 'sw_auth_signature',
  MESSAGE: 'sw_auth_message',
  TIMESTAMP: 'sw_auth_timestamp',
  ADDRESS: 'sw_auth_address',
  CHAIN: 'sw_auth_chain',
} as const;
