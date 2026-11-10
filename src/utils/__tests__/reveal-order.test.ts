import { describe, expect, test } from "bun:test";
import {
	REVEAL_DURATION,
	REVEAL_SPREAD,
	SWEEP_EDGE,
	SWEEP_SPEED,
} from "../../constants";
import type { ShapeMap } from "../../skeleton";
import { EMPTY_PLAN, planReveal } from "../reveal-order";

const ORIGIN = { x: 0, y: 0 };

/** One bar per piece, `{ id: [x, y] }`, each 100 × 20. */
function bars(positions: Record<string, [number, number]>): ShapeMap {
	return Object.fromEntries(
		Object.entries(positions).map(([id, [x, y]]) => [
			id,
			[{ x, y, width: 100, height: 20, radius: 4 }],
		]),
	);
}

describe("together", () => {
	test("every piece at once", () => {
		const plan = planReveal(
			bars({ a: [0, 0], b: [0, 300] }),
			"together",
			ORIGIN,
		);
		expect(plan).toEqual(EMPTY_PLAN);
	});
});

describe("sequence", () => {
	const plan = planReveal(
		bars({ top: [0, 0], left: [0, 50], right: [200, 50], bottom: [0, 100] }),
		"sequence",
		ORIGIN,
	);

	test("top to bottom, spread over REVEAL_SPREAD", () => {
		expect(plan.delays.top).toBe(0);
		expect(plan.delays.left).toBe(REVEAL_SPREAD / 2);
		expect(plan.delays.bottom).toBe(REVEAL_SPREAD);
	});

	test("pieces on the same row go together", () => {
		expect(plan.delays.left).toBe(plan.delays.right ?? Number.NaN);
	});

	test("the clock runs until the last piece has faded in", () => {
		expect(plan.total).toBe(REVEAL_SPREAD + REVEAL_DURATION);
	});
});

describe("smart", () => {
	test("under 4 rows: one crossfade", () => {
		const plan = planReveal(
			bars({ a: [0, 0], b: [0, 30], c: [0, 60] }),
			"smart",
			ORIGIN,
		);
		expect(plan).toEqual(EMPTY_PLAN);
	});

	test("4 rows or more: a sequence", () => {
		const plan = planReveal(
			bars({ a: [0, 0], b: [0, 30], c: [0, 60], d: [0, 90] }),
			"smart",
			ORIGIN,
		);
		expect(plan.delays.a).toBe(0);
		expect(plan.delays.d).toBe(REVEAL_SPREAD);
	});
});

describe("sweep", () => {
	// The wipe moves along the shimmer's 110° direction (CSS angle).
	const angle = (110 * Math.PI) / 180;
	const along = (x: number, y: number) =>
		x * Math.sin(angle) - y * Math.cos(angle);
	const msPerPoint = 1000 / SWEEP_SPEED;
	const groups = bars({ left: [0, 0], right: [200, 0] });
	const plan = planReveal(groups, "sweep", ORIGIN);

	test("a piece starts when the edge reaches its top-left corner", () => {
		expect(plan.delays.left).toBe(0);
		expect(plan.delays.right ?? 0).toBeCloseTo(along(200, 0) * msPerPoint);
	});

	test("each piece fades for as long as the edge takes to cross it", () => {
		const crossing = along(100, 20) - along(0, 0);
		expect(plan.fades.left ?? 0).toBeCloseTo(
			(crossing + SWEEP_EDGE) * msPerPoint,
		);
	});

	test("the clock runs until the edge has passed the last corner", () => {
		expect(plan.total).toBeCloseTo((along(300, 20) + SWEEP_EDGE) * msPerPoint);
	});

	test("moving the skeleton on screen shifts the wipe, not the timing", () => {
		const moved = planReveal(groups, "sweep", { x: 50, y: 30 });
		expect(moved.delays.right ?? 0).toBeCloseTo(plan.delays.right ?? 0);
		expect(moved.sweepFrom ?? 0).toBeCloseTo(along(50, 30));
	});
});

test("nothing measured: nothing to plan", () => {
	expect(planReveal({}, "sweep", ORIGIN)).toEqual(EMPTY_PLAN);
});
