import { Easing } from "react-native-reanimated";

/**
 * Reveal clock value meaning "nothing to reveal": every piece fully shown.
 * Used when content appears without a skeleton (it was there already, or
 * data beat SHOW_DELAY).
 */
export const REVEAL_FINISHED = 1e9;

/** CSS `ease`, the curve Skullet uses for its fades. */
export const CSS_EASE = Easing.bezierFn(0.25, 0.1, 0.25, 1);

/** Linear 0 → 1 through one piece's fade, from its own delay. */
function linearProgress(clock: number, delay: number, fade: number): number {
	"worklet";
	return Math.min(1, Math.max(0, (clock - delay) / fade));
}

/**
 * A piece's content opacity, eased in. Its bars fade out on exactly the
 * opposite curve (a symmetric crossfade, as Skullet does). The bars sit on
 * top and keep shimmering while they fade, so the light is seen passing
 * over the arriving content.
 */
export function contentProgress(
	clock: number,
	delay: number,
	fade: number,
): number {
	"worklet";
	return CSS_EASE(linearProgress(clock, delay, fade));
}

/** A piece's bar opacity: the mirror of its content's. */
export function boneOpacity(
	clock: number,
	delay: number,
	fade: number,
): number {
	"worklet";
	return 1 - contentProgress(clock, delay, fade);
}
