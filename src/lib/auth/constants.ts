export const SIGNATURE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export const AUTH_STORAGE_KEYS = {
  SIGNATURE: 'sw_auth_signature',
  MESSAGE: 'sw_auth_message',
  TIMESTAMP: 'sw_auth_timestamp',
  ADDRESS: 'sw_auth_address',
  CHAIN: 'sw_auth_chain',
} as const;
