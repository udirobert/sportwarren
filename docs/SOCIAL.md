# Social Layer

This consolidates two user-facing social features while keeping privacy and performance central:

- Private Squad Media (Telegram Mini App): encrypted-by-context access to match photos/clips shared only with the squad.
- Lens Publishing (optional): enable public highlights via a real Lens gateway — disabled by default.

Core Principles applied: Enhancement-first, Consolidation, DRY, Modular, Organized.

---

Private Squad Media (Telegram)

- Endpoints
  - `POST src/app/api/telegram/mini-app/media/upload`: `{ token, dataBase64, mimeType, title?, visibility? }`
  - `POST src/app/api/telegram/mini-app/media/list`: `{ token }` → `{ items: [...] }`
  - `GET  src/app/api/telegram/mini-app/media/[mediaId]?token=...` → streams image/video if authorized
  - `GET  src/app/api/telegram/mini-app/media/thumb/[mediaId]?token=...` → streams thumbnail if available
  - `PATCH src/app/api/telegram/mini-app/media/[mediaId]`: `{ token, visibility }` (uploader or captain/vice_captain)
  - `DELETE src/app/api/telegram/mini-app/media/[mediaId]`: `{ token }` (soft-delete; uploader or captain/vice_captain)
  - `POST  src/app/api/admin/media/gc` (Authorization: `Bearer ADMIN_TOKEN`) — purges soft-deleted blobs older than `olderHours` (default 24)
- Auth: Mini App `token` resolves to a PlatformIdentity and active squad. Only squad members can list/read; `visibility: private` restricts to uploader.
- Storage: local filesystem under `storage/squads/<squadId>/<mediaId>.<ext>` (not public). Served via an authenticated API route; no public URLs.
- Schema: `SquadMedia` in `prisma/schema.prisma`.
- Config: `STORAGE_ROOT` (optional, defaults to `<repo>/storage`).

Storage Backend Toggle
- `MEDIA_STORAGE=local` (default) saves to the local filesystem.
- `MEDIA_STORAGE=ipfs` switches to IPFS via a simple HTTP gateway interface:
  - `IPFS_GATEWAY_UPLOAD_URL=https://.../upload` (expects `{ cid }` in JSON response)
  - `IPFS_GATEWAY_READ_URL=https://.../ipfs` (files are fetched at `READ_URL/<cid>`)
  - `IPFS_GATEWAY_API_KEY=...` (optional header `Authorization: Bearer`)
Encryption by Default (Server-side)
- Set `MEDIA_MASTER_KEY` to a 32-byte base64 key (required). Example: `openssl rand -base64 32`.
- The server creates a per-squad media key (encrypted with the master) and uses AES-256-GCM to encrypt content before storage.
- Stored bytes (local or IPFS) are ciphertext; the API decrypts on read if the viewer is authorized and a squad member.
Notes: This design improves privacy vs. public IPFS while keeping the UX seamless. You can later evolve to client-side/end-to-end encryption without changing API contracts.

Notes
- The API accepts raw base64 for consistency with existing imageData flows. A future enhancement can switch to multipart/form-data.
- If you want IPFS/Filecoin, implement an `IpfsStorageAdapter` and swap the storage call in `src/server/services/communication/media.ts`.

---

Lens Integration (Optional)

The server now exposes a real, non-stub Lens service via an env-configured HTTP gateway.

- Feature flag: set either `ENABLE_LENS_SOCIAL=true` or `NEXT_PUBLIC_LENS_SOCIAL_ENABLED=true`.
- Gateway configuration (one of):
  - `LENS_GATEWAY_URL=https://your-lens-gateway.example.com` (expects `/api/lens/{challenge,authenticate,post}`)
  - or `LENS_API_BASE=https://your-lens-gateway.example.com` (same paths)
  - Optional: `LENS_API_KEY=...` if your gateway requires auth

Client Flow
- `src/contexts/LensContext.tsx` manages login and posting; UI components use its `login()` and `post*()` methods.
- Next routes under `src/app/api/lens/*` proxy to the Express server at `NEXT_PUBLIC_SERVER_URL`.
- Express server (`server/index.ts`) calls `server/services/communication/lens.ts` which forwards to the configured gateway.

Security
- No fake responses: when disabled or unconfigured, Lens endpoints return 503 and the client shows an unavailable state.

---

Mini App UI
- A new “Media” tab is added to the Telegram Mini App.
- Component: `src/components/telegram/TelegramMediaTab.tsx`
- Features: list squad media, upload photo/video (base64) with visibility (Squad/Private), and view inline.
- Lightbox preview supports images and videos (preload metadata only for performance).
- Client and server apply a 25MB max file size guard for reliability.
- Each tile exposes small actions (Make Private/Make Squad, Delete) for the uploader or squad leaders.

Thumbnails
- Client generates a JPEG thumbnail (<= 480px) for images/videos and uploads alongside the media.
- The grid uses the thumbnail endpoint when available for faster loads; the lightbox fetches full media.

---

Migration & Seed
- Migration: `prisma/migrations/20260328090000_add_squad_media.sql`
- Optional seed: set `SEED_SQUAD_MEDIA_SAMPLE=true` then run your seed command. It writes a 1×1 PNG into storage and creates a matching `SquadMedia` row.


---

Roadmap (Optional Enhancements)
- Add IPFS/IPLD storage adapter with squad-scope encryption and publish CIDs only to the squad.
- Add in-app “Share to Lens” preview with explicit privacy controls (off by default).
- Add signed URL short‑lived access for web clients mirroring the Mini App token model.
- Share to Lens (Optional)
- `POST src/app/api/telegram/mini-app/media/share-url` → returns a short-lived signed URL (defaults 10 minutes)
- `GET  src/app/api/telegram/mini-app/media/public/[mediaId]?exp=...&sig=...` → serves decrypted media for signed URLs only
- Client uses `LensContext` to login/post and passes the signed imageUrl to `/api/lens/post`.

Config
- `MEDIA_SHARE_SECRET` (base64, >=32 bytes) for signed URL HMAC (falls back to `MEDIA_MASTER_KEY`)
- `ADMIN_TOKEN` to protect the GC endpoint
