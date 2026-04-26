import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_MAX_INIT_DATA_AGE_SECONDS = 60 * 60 * 24; // 24h

interface TelegramInitDataUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramInitDataChat {
  id: number;
}

export interface VerifiedTelegramInitData {
  platformUserId: string;
  chatId: string | null;
  username: string | null;
  displayName: string | null;
  photoUrl: string | null;
  authDate: Date;
  startParam: string | null;
}

export function verifyTelegramWebAppInitData(
  initData: string,
  options?: { maxAgeSeconds?: number },
): { ok: true; data: VerifiedTelegramInitData } | { ok: false; error: string } {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) {
    return { ok: false, error: "Telegram auth is not configured on this deployment." };
  }

  const parsed = new URLSearchParams(initData);
  const hash = parsed.get("hash")?.trim();
  if (!hash) {
    return { ok: false, error: "Telegram init data hash is missing." };
  }

  const dataCheckString = [...parsed.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  if (!timingSafeEqualHex(computedHash, hash)) {
    return { ok: false, error: "Telegram init data signature is invalid." };
  }

  const authDateRaw = parsed.get("auth_date");
  const authDateSeconds = authDateRaw ? Number.parseInt(authDateRaw, 10) : NaN;
  if (!Number.isFinite(authDateSeconds) || authDateSeconds <= 0) {
    return { ok: false, error: "Telegram auth date is invalid." };
  }

  const maxAgeSeconds = options?.maxAgeSeconds ?? DEFAULT_MAX_INIT_DATA_AGE_SECONDS;
  if (Math.floor(Date.now() / 1000) - authDateSeconds > maxAgeSeconds) {
    return { ok: false, error: "Telegram init data is stale. Re-open the Mini App." };
  }

  const userRaw = parsed.get("user");
  if (!userRaw) {
    return { ok: false, error: "Telegram user data is missing." };
  }

  const user = parseUser(userRaw);
  if (!user) {
    return { ok: false, error: "Telegram user data is invalid." };
  }

  const chatRaw = parsed.get("chat");
  const chat = chatRaw ? parseChat(chatRaw) : null;
  const displayName = buildDisplayName(user);

  return {
    ok: true,
    data: {
      platformUserId: String(user.id),
      chatId: chat ? String(chat.id) : null,
      username: user.username ?? null,
      displayName,
      photoUrl: user.photo_url?.trim() || null,
      authDate: new Date(authDateSeconds * 1000),
      startParam: parsed.get("start_param"),
    },
  };
}

function parseUser(raw: string): TelegramInitDataUser | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const candidate = value as Record<string, unknown>;
    const id = candidate.id;
    if (typeof id !== "number" || !Number.isFinite(id)) {
      return null;
    }

    const user: TelegramInitDataUser = { id };

    if (typeof candidate.first_name === "string") {
      user.first_name = candidate.first_name;
    }
    if (typeof candidate.last_name === "string") {
      user.last_name = candidate.last_name;
    }
    if (typeof candidate.username === "string") {
      user.username = candidate.username;
    }
    if (typeof candidate.photo_url === "string") {
      user.photo_url = candidate.photo_url;
    }

    return user;
  } catch {
    return null;
  }
}

function parseChat(raw: string): TelegramInitDataChat | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const candidate = value as Record<string, unknown>;
    const id = candidate.id;
    if (typeof id !== "number" || !Number.isFinite(id)) {
      return null;
    }

    return { id };
  } catch {
    return null;
  }
}

function buildDisplayName(user: TelegramInitDataUser): string | null {
  const fromNames = [user.first_name, user.last_name]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .trim();

  if (fromNames.length > 0) {
    return fromNames;
  }

  if (user.username?.trim()) {
    return user.username.trim();
  }

  return null;
}

function timingSafeEqualHex(left: string, right: string): boolean {
  if (left.length !== right.length || left.length % 2 !== 0) {
    return false;
  }

  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
