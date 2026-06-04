/**
 * Storage adapter — single interface for all media uploads.
 *
 * Owner-typed: every saved object belongs to a player or a squad, with a
 * `kind` describing what it is (avatar, encrypted media, moment render,
 * badge). This replaces the older `squadId, mediaId` interface so we can
 * store avatars (per-player, multiple variants) and moment renders
 * (per-twin) through the same code path.
 *
 * Path layout (local adapter):
 *   players/<ownerId>/avatar/<variantId>.<ext>
 *   squads/<ownerId>/media/<mediaId>.<ext>
 *   squads/<ownerId>/avatar/<variantId>.<ext>
 *   squads/<ownerId>/badge/<variantId>.<ext>
 *   moments/<ownerType>/<ownerId>/<momentId>.<ext>
 *
 * IPFS adapter stores opaque `ipfs/<cid>` keys; layout is the gateway's
 * concern, not ours.
 */

export type StorageOwnerType = 'player' | 'squad';

export type StorageKind =
  | 'avatar'
  | 'media'
  | 'moment-render'
  | 'badge';

export interface SaveBase64Opts {
  ownerType: StorageOwnerType;
  ownerId: string;
  kind: StorageKind;
  base64Data: string;
  extension: string;
  mimeType: string;
  /** Required for `media` kind; the row id of the encrypted payload. */
  mediaId?: string;
  /** Required for `avatar` / `badge` kind; e.g. 'main', 'square', 'thumb'. */
  variantId?: string;
  /** Required for `moment-render` kind; the moment row id. */
  momentId?: string;
}

export interface StoredObject {
  key: string;
  size: number;
}

export interface StorageAdapter {
  saveBase64(opts: SaveBase64Opts): Promise<StoredObject>;
  readByKey(key: string): Promise<Buffer>;
  removeByKey?(key: string): Promise<void>;
}
