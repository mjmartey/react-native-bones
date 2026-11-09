import { type SkColor, Skia } from "@shopify/react-native-skia";
import { SHIMMER_ANGLE, SHIMMER_FALL, SHIMMER_RISE } from "../constants";

/** Samples per edge of the band; enough for a smooth curve. */
const STEPS = 12;

/** Sine ease in-out, 0 → 1. Matches the alpha curve Skullet's band uses. */
function ease(t: number): number {
	return (1 - Math.cos(Math.PI * t)) / 2;
}

function mix(a: SkColor, b: SkColor, t: number): SkColor {
	const out = new Float32Array(4);
	for (let channel = 0; channel < 4; channel++) {
		const from = a[channel] ?? 0;
		out[channel] = from + ((b[channel] ?? 0) - from) * t;
	}
	return out;
}

/**
 * Colour stops for one period of the shimmer: base, a soft eased rise to
 * the highlight, a short eased fall back to base, then base until the period
 * repeats.
 */
export function shimmerStops(base: string, highlight: string) {
	const from = Skia.Color(base);
	const to = Skia.Color(highlight);
	const colors: SkColor[] = [];
	const positions: number[] = [];

	for (let step = 0; step <= STEPS; step++) {
		const t = step / STEPS;
		positions.push(SHIMMER_RISE * t);
		colors.push(mix(from, to, ease(t)));
	}
	for (let step = 1; step <= STEPS; step++) {
		const t = step / STEPS;
		positions.push(SHIMMER_RISE + SHIMMER_FALL * t);
		colors.push(mix(to, from, ease(t)));
	}
	positions.push(1);
	colors.push(from);

	return { colors, positions };
}

/** Unit vector of the gradient, from a CSS angle (0° up, 90° right). */
const radians = (SHIMMER_ANGLE * Math.PI) / 180;
export const SHIMMER_DIRECTION = {
	x: Math.sin(radians),
	y: -Math.cos(radians),
};
