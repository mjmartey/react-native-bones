/** Corner radius for bars when the measured element doesn't set its own. */
export const DEFAULT_RADIUS = 6;

/**
 * A font's natural text height is about 1.7x its cap height for typical UI
 * fonts (SF Pro 15pt: cap 10.57, natural 17.90). Cap height is the one line
 * metric a custom lineHeight doesn't inflate, so bars are sized from it.
 */
export const TEXT_HEIGHT_PER_CAP_HEIGHT = 1.7;

/** Bar colours until the theme provider (Step 5) makes them configurable. */
export const DEFAULT_COLORS = {
	base: "#E4E7EC",
	highlight: "#F5F6F8",
} as const;

/** One sweep of the shimmer across the screen, in milliseconds. */
export const SHIMMER_DURATION = 1600;

/** Width of the shimmer's bright band, as a share of the screen width. */
export const SHIMMER_BAND = 0.5;
