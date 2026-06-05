import { createHmac, timingSafeEqual } from "crypto";

export interface ShareClaimTokenPayload {
  claimId: string;
  shareId: string;
  positionIndex: number;
  remixSlug: string;
  issuedAt: number;
}

const TOKEN_VERSION = "v1";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getTokenSecret(): string {
  const secret =
    process.env.CLAIM_CONTEXT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    process.env.DATABASE_URL;

  if (!secret) {
    throw new Error("CLAIM_CONTEXT_SECRET or another stable server secret is required");
  }

  return secret;
}

function encodePart(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signPart(payloadPart: string): string {
  return createHmac("sha256", getTokenSecret()).update(payloadPart).digest("base64url");
}

export function signShareClaimToken(input: Omit<ShareClaimTokenPayload, "issuedAt">): string {
  const payload: ShareClaimTokenPayload = {
    ...input,
    issuedAt: Date.now(),
  };
  const payloadPart = encodePart(payload);
  return `${TOKEN_VERSION}.${payloadPart}.${signPart(payloadPart)}`;
}

export function verifyShareClaimToken(token: string): ShareClaimTokenPayload | null {
  const [version, payloadPart, signature] = token.split(".");
  if (version !== TOKEN_VERSION || !payloadPart || !signature) return null;

  const expected = signPart(payloadPart);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as Partial<ShareClaimTokenPayload>;
    if (
      typeof payload.claimId !== "string" ||
      typeof payload.shareId !== "string" ||
      typeof payload.positionIndex !== "number" ||
      typeof payload.remixSlug !== "string" ||
      typeof payload.issuedAt !== "number"
    ) {
      return null;
    }
    if (Date.now() - payload.issuedAt > TOKEN_TTL_MS) return null;
    return payload as ShareClaimTokenPayload;
  } catch {
    return null;
  }
}
