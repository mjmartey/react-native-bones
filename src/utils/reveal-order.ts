import { REVEAL_SPREAD, SMART_SEQUENCE_ROWS } from "../constants";
import type { ShapeMap } from "../skeleton";
import type { BonesReveal } from "../types";

export type RevealDelays = Readonly<Record<string, number>>;

/**
 * When each piece starts its reveal, in ms. A piece's position is the
 * top-left corner of its bars. `sequence` spreads pieces by y (pieces on
 * the same row go together); `sweep` by x on screen, so side-by-side
 * skeletons are uncovered as one surface; `smart` picks `together` or
 * `sequence` from how many rows there are.
 */
export function revealDelays(
	groups: ShapeMap,
	mode: BonesReveal,
	originX: number,
	screenWidth: number,
): RevealDelays {
	const delays: Record<string, number> = {};
	if (mode === "together") return delays;

	const corners = Object.entries(groups).flatMap(([id, shapes]) =>
		shapes.length === 0
			? []
			: [
					{
						id,
						x: Math.min(...shapes.map((shape) => shape.x)),
						y: Math.min(...shapes.map((shape) => shape.y)),
					},
				],
	);

	// Smart: a few rows crossfade together; more rows play a sequence.
	// (Data that beat SHOW_DELAY never gets here: it shows with no reveal.)
	if (mode === "smart") {
		const rows = new Set(corners.map((corner) => Math.round(corner.y)));
		if (rows.size < SMART_SEQUENCE_ROWS) return delays;
	}

	if (mode === "sweep") {
		for (const { id, x } of corners) {
			const onScreen = Math.min(Math.max((originX + x) / screenWidth, 0), 1);
			delays[id] = onScreen * REVEAL_SPREAD;
		}
		return delays;
	}

	const ys = corners.map((corner) => corner.y);
	const top = Math.min(...ys);
	const range = Math.max(...ys) - top;
	for (const { id, y } of corners) {
		delays[id] = range > 0 ? ((y - top) / range) * REVEAL_SPREAD : 0;
	}
	return delays;
}

export function longestDelay(delays: RevealDelays): number {
	return Math.max(0, ...Object.values(delays));
}
