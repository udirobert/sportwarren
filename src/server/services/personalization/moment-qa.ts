/**
 * Moment-card QA gate — deterministic verification of the rendered artifact
 * before it is stored and shown.
 *
 * The winners' QA-agent pattern (Matchcut watches each film before a fan sees
 * it), applied at the seam where it matters: between render and storage. A
 * moment card is how a group's history gets remembered — a blank, truncated,
 * or wrongly-sized PNG stored against the Moment row is a broken memory.
 *
 * Two checks, both pure and dependency-free:
 *   1. `verifyMomentRow` — the Moment row is renderable (required fields,
 *      bounded text) before we spend a render on it.
 *   2. `verifyMomentPng` — the produced PNG is a real, correctly-sized,
 *      non-trivial image (signature + IHDR dimensions + byte floor).
 *
 * Fail closed: a QA failure throws `MomentQaError`, the row keeps
 * `renderedKey: null`, and the batch reports it as `qaRejected` — nothing
 * unverified is stored.
 */

export class MomentQaError extends Error {
  readonly check: string;

  constructor(check: string, reason: string) {
    super(`Moment QA [${check}]: ${reason}`);
    this.name = 'MomentQaError';
    this.check = check;
  }
}

export interface MomentForQa {
  kind: string;
  tier: string;
  label: string;
  detail: string | null;
  createdAt: Date;
  subjectType: string;
}

const MAX_LABEL_LEN = 200;
const MAX_DETAIL_LEN = 500;

/**
 * The moment row must carry everything a card needs before we render it.
 * Deliberately permissive about *which* kinds/tiers exist — unmapped kinds
 * legitimately fall back to DefaultCard — but strict that the fields exist
 * and are bounded, since card layout assumes short strings.
 */
export function verifyMomentRow(moment: MomentForQa): void {
  if (!moment.kind || typeof moment.kind !== 'string') {
    throw new MomentQaError('row', `missing kind`);
  }
  if (!moment.tier || typeof moment.tier !== 'string') {
    throw new MomentQaError('row', `missing tier for kind ${moment.kind}`);
  }
  if (moment.subjectType !== 'player' && moment.subjectType !== 'squad') {
    throw new MomentQaError('row', `unknown subjectType "${moment.subjectType}"`);
  }
  if (!moment.label || !moment.label.trim()) {
    throw new MomentQaError('row', `empty label for kind ${moment.kind}`);
  }
  if (moment.label.length > MAX_LABEL_LEN) {
    throw new MomentQaError('row', `label ${moment.label.length} chars > ${MAX_LABEL_LEN}`);
  }
  if (moment.detail && moment.detail.length > MAX_DETAIL_LEN) {
    throw new MomentQaError('row', `detail ${moment.detail.length} chars > ${MAX_DETAIL_LEN}`);
  }
  if (!(moment.createdAt instanceof Date) || Number.isNaN(moment.createdAt.getTime())) {
    throw new MomentQaError('row', `invalid createdAt`);
  }
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * A blank or near-blank card compresses to a few KB. Real archetype cards —
 * pitch texture, type, avatar artwork — are well above this floor, so a PNG
 * under it is almost certainly an empty render that resvg produced without
 * complaint.
 */
const MIN_PNG_BYTES = 4096;

/**
 * Verify the produced PNG itself: signature, IHDR dimensions at the expected
 * 2x retina size, and a non-trivial byte count. Throws `MomentQaError` on any
 * failure so the caller can distinguish QA rejections from render crashes.
 */
export function verifyMomentPng(
  png: Buffer,
  expected: { width: number; height: number },
): void {
  if (png.length < 33 || !png.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new MomentQaError('png', `not a PNG (${png.length} bytes)`);
  }

  // IHDR is always the first chunk: length(4) "IHDR"(4) width(4) height(4) at
  // byte offset 8; width/height are big-endian uint32.
  const chunkType = png.subarray(12, 16).toString('ascii');
  if (chunkType !== 'IHDR') {
    throw new MomentQaError('png', `first chunk is "${chunkType}", expected IHDR`);
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== expected.width || height !== expected.height) {
    throw new MomentQaError(
      'png',
      `dimensions ${width}x${height}, expected ${expected.width}x${expected.height}`,
    );
  }

  if (png.length < MIN_PNG_BYTES) {
    throw new MomentQaError('png', `only ${png.length} bytes — likely a blank render`);
  }
}
