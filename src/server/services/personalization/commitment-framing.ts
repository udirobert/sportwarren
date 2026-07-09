/**
 * Commitment framing — the copy logic for the peak-end "next game" capture.
 *
 * Pure + testable. Encodes the on-thesis behavioural levers from the
 * behavioural-design doctrine (product-calibration.md):
 *  - loss-framing the group's ritual: "needs N to happen — M in, K to go"
 *    (the game itself is at risk; honest, because games do fall through)
 *  - honest social proof: "M already in"
 *  - never bandwagon-shaming (no "everyone's in but you").
 */

export interface CommitmentFraming {
  /** Headline line for the capture surface. */
  line: string;
  /** True once enough players are in for the game to happen. */
  met: boolean;
  /** Players still needed (0 once met). */
  toGo: number;
}

/**
 * @param inCount  how many have committed 'in'
 * @param target   minimum players for the game to happen
 * @param youIn    whether the current viewer has already committed
 */
export function commitmentFraming(
  inCount: number,
  target: number,
  youIn: boolean,
): CommitmentFraming {
  const toGo = Math.max(0, target - inCount);
  const met = inCount >= target;

  if (met) {
    return {
      met: true,
      toGo: 0,
      line: youIn
        ? `You're in — and so are ${inCount - 1} others. Game's on. 🟢`
        : `${inCount} in — the game's on. Grab your spot.`,
    };
  }

  // Not yet enough — loss-frame the ritual honestly.
  if (inCount === 0) {
    return { met: false, toGo, line: `Be the first to lock in next week — it needs ${target} to happen.` };
  }
  return {
    met: false,
    toGo,
    line: youIn
      ? `You're in. ${inCount} so far — ${toGo} more to make it happen.`
      : `${inCount} in · ${toGo} more needed to make next week happen.`,
  };
}
