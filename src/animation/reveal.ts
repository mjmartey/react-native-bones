import { REVEAL_DURATION } from "../constants";

/**
 * Reveal clock value meaning "nothing to reveal": every piece fully shown.
 * Used when content appears without a skeleton (it was there already, or
 * data beat SHOW_DELAY).
 */
export const REVEAL_FINISHED = 1e9;

/**
 * How far one piece is through its reveal, 0 → 1. `clock` is milliseconds
 * since the reveal started; `delay` is when this piece starts (0 for now,
 * per-piece delays come with the sequence and sweep modes).
 */
export function pieceProgress(clock: number, delay: number): number {
	"worklet";
	return Math.min(1, Math.max(0, (clock - delay) / REVEAL_DURATION));
}
