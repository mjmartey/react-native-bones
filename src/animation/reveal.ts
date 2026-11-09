import { Easing } from "react-native-reanimated";
import { REVEAL_DURATION } from "../constants";

/**
 * Reveal clock value meaning "nothing to reveal": every piece fully shown.
 * Used when content appears without a skeleton (it was there already, or
 * data beat SHOW_DELAY).
 */
export const REVEAL_FINISHED = 1e9;

/** CSS `ease`, the curve Skullet uses for its fades. */
export const CSS_EASE = Easing.bezierFn(0.25, 0.1, 0.25, 1);

/**
 * Content starts fading in this share of the reveal before its bars start
 * fading out. Without it, both sit near 50% halfway and the card looks
 * washed out; with it, content is mostly in before the bars dissolve.
 */
const OVERLAP = 0.25;

/** Linear 0 → 1 through one piece's reveal, from its own delay. */
function linearProgress(clock: number, delay: number): number {
	"worklet";
	return Math.min(1, Math.max(0, (clock - delay) / REVEAL_DURATION));
}

/** A piece's content opacity: eased in over the first part of its reveal. */
export function contentProgress(clock: number, delay: number): number {
	"worklet";
	return CSS_EASE(Math.min(1, linearProgress(clock, delay) / (1 - OVERLAP)));
}

/** A piece's bar opacity: eased out over the last part of its reveal. */
export function boneOpacity(clock: number, delay: number): number {
	"worklet";
	const t = (linearProgress(clock, delay) - OVERLAP) / (1 - OVERLAP);
	return 1 - CSS_EASE(Math.max(0, t));
}
