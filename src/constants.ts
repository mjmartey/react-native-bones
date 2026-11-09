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

/** One full pulse (bright → dim → bright), in milliseconds. */
export const PULSE_DURATION = 1600;

/*
 * Shimmer geometry, after Skullet: a repeating gradient at 110° (CSS angle:
 * 0° points up, 90° right). The repeat scales with the screen, so a card
 * sees one wide, soft band at a time. Each band rises softly over
 * SHIMMER_RISE of the repeat and falls over SHIMMER_FALL; the rest is the
 * plain bar colour.
 */
export const SHIMMER_ANGLE = 110;
/** One band every this many screen widths. */
export const SHIMMER_PERIOD = 1.5;
export const SHIMMER_RISE = 0.34;
export const SHIMMER_FALL = 0.1;

/** Time for the bands to move on by one repeat, in milliseconds. */
export const SHIMMER_DURATION = 2400;

/**
 * Wait this long before showing bars. Data that arrives sooner (a cache hit,
 * a fast network) appears directly, without a skeleton flashing up and away.
 */
export const SHOW_DELAY = 150;

/** How long the bars take to fade out over the real content. */
export const REVEAL_DURATION = 240;

/** Extra time the last piece waits in `sequence` and `sweep` reveals. */
export const REVEAL_SPREAD = 240;

/**
 * `smart` plays a `sequence` once content has this many rows (pieces at
 * different heights); below that, one crossfade reads better.
 */
export const SMART_SEQUENCE_ROWS = 4;

/** How long the skeleton takes to fade in when it first appears. */
export const APPEAR_DURATION = 200;
