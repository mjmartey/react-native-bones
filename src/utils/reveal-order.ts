import {
	REVEAL_DURATION,
	REVEAL_SPREAD,
	SMART_SEQUENCE_ROWS,
	SWEEP_EDGE,
	SWEEP_SPEED,
} from "../constants";
import type { ShapeMap } from "../skeleton";
import type { BonesReveal } from "../types";
import { SHIMMER_DIRECTION } from "./shimmer";

/** Everything a reveal needs, worked out once as it starts. */
export type RevealPlan = Readonly<{
	/** When each piece (by id) starts fading in, in ms. Missing means 0. */
	delays: Readonly<Record<string, number>>;
	/** How long one piece takes to fade in, in ms. */
	fade: number;
	/** How long the whole reveal takes, in ms. */
	total: number;
	/**
	 * Sweep only: where the wipe starts, as a distance along the shimmer's
	 * direction in screen coordinates. `null` for every other mode.
	 */
	sweepFrom: number | null;
}>;

export const EMPTY_PLAN: RevealPlan = {
	delays: {},
	fade: REVEAL_DURATION,
	total: REVEAL_DURATION,
	sweepFrom: null,
};

/** Distance of a screen point along the shimmer's 110° direction. */
function along(x: number, y: number): number {
	return x * SHIMMER_DIRECTION.x + y * SHIMMER_DIRECTION.y;
}

/**
 * Plans a reveal from the bars on screen. A piece's position is the
 * top-left corner of its bars.
 * - `together`: every piece at 0.
 * - `sequence`: spread by y (pieces on the same row go together).
 * - `sweep`: a soft diagonal edge, at the shimmer's angle, wipes across;
 *   each piece fades in as the edge reaches it.
 * - `smart`: `together` for a few rows, `sequence` for more.
 */
export function planReveal(
	groups: ShapeMap,
	mode: BonesReveal,
	origin: Readonly<{ x: number; y: number }>,
): RevealPlan {
	const pieces = Object.entries(groups).flatMap(([id, shapes]) =>
		shapes.length === 0
			? []
			: [
					{
						id,
						x: Math.min(...shapes.map((shape) => shape.x)),
						y: Math.min(...shapes.map((shape) => shape.y)),
						right: Math.max(...shapes.map((shape) => shape.x + shape.width)),
						bottom: Math.max(...shapes.map((shape) => shape.y + shape.height)),
					},
				],
	);
	if (pieces.length === 0 || mode === "together") return EMPTY_PLAN;

	if (mode === "sweep") {
		// The direction points right and down, so a piece's top-left corner is
		// the first part the edge reaches, and its bottom-right the last.
		const starts = pieces.map((piece) => ({
			id: piece.id,
			at: along(origin.x + piece.x, origin.y + piece.y),
		}));
		const from = Math.min(...starts.map((start) => start.at));
		const to = Math.max(
			...pieces.map((piece) =>
				along(origin.x + piece.right, origin.y + piece.bottom),
			),
		);
		const msPerPoint = 1000 / SWEEP_SPEED;
		const delays: Record<string, number> = {};
		for (const { id, at } of starts) delays[id] = (at - from) * msPerPoint;
		return {
			delays,
			fade: SWEEP_EDGE * msPerPoint,
			total: (to - from + SWEEP_EDGE) * msPerPoint,
			sweepFrom: from,
		};
	}

	// Smart: a few rows crossfade together; more rows play a sequence.
	// (Data that beat SHOW_DELAY never gets here: it shows with no reveal.)
	if (mode === "smart") {
		const rows = new Set(pieces.map((piece) => Math.round(piece.y)));
		if (rows.size < SMART_SEQUENCE_ROWS) return EMPTY_PLAN;
	}

	const ys = pieces.map((piece) => piece.y);
	const top = Math.min(...ys);
	const range = Math.max(...ys) - top;
	const delays: Record<string, number> = {};
	for (const { id, y } of pieces) {
		delays[id] = range > 0 ? ((y - top) / range) * REVEAL_SPREAD : 0;
	}
	return {
		delays,
		fade: REVEAL_DURATION,
		total: REVEAL_SPREAD + REVEAL_DURATION,
		sweepFrom: null,
	};
}
