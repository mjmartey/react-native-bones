/** Corner radius for bars when the measured element doesn't set its own. */
export const DEFAULT_RADIUS = 6;

/**
 * A font's natural text height is about 1.7x its cap height for typical UI
 * fonts (SF Pro 15pt: cap 10.57, natural 17.90). Cap height is the one line
 * metric a custom lineHeight doesn't inflate, so bars are sized from it.
 */
export const TEXT_HEIGHT_PER_CAP_HEIGHT = 1.7;

/** Default bar colours per colour scheme; override them with `BonesProvider`. */
export const DEFAULT_COLORS = {
	light: { base: "#E4E7EC", highlight: "#F5F6F8" },
	dark: { base: "#2A2F37", highlight: "#3A414C" },
} as const;

/**
 * One sweep of the shimmer (or one pulse), in milliseconds. App-wide on
 * purpose: one shared clock is what keeps every skeleton in step.
 */
export const SHIMMER_DURATION = 1600;

/** Width of the shimmer's bright band, as a share of the screen width. */
export const SHIMMER_BAND = 0.5;

/**
 * Wait this long before showing bars. Data that arrives sooner (a cache hit,
 * a fast network) appears directly, without a skeleton flashing up and away.
 */
export const SHOW_DELAY = 150;

/** How long the bars take to fade out over the real content. */
export const REVEAL_DURATION = 250;
