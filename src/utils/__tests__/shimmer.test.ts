import { describe, expect, test } from "bun:test";
import { SHIMMER_FALL, SHIMMER_RISE } from "../../constants";
import { SHIMMER_DIRECTION, shimmerStops } from "../shimmer";

describe("shimmerStops", () => {
	// Black → white makes each colour's red channel read as "how bright".
	const { colors, positions } = shimmerStops("#000000", "#FFFFFF");
	const brightness = colors.map((color) => color[0] ?? Number.NaN);

	test("positions run 0 → 1 and never go backwards", () => {
		expect(positions[0]).toBe(0);
		expect(positions.at(-1)).toBe(1);
		for (let i = 1; i < positions.length; i++) {
			expect(positions[i] ?? 0).toBeGreaterThanOrEqual(positions[i - 1] ?? 0);
		}
	});

	test("the band peaks at SHIMMER_RISE and is gone by RISE + FALL", () => {
		const peak = positions.indexOf(SHIMMER_RISE);
		expect(brightness[peak]).toBeCloseTo(1);
		const gone = positions.findIndex(
			(position) => Math.abs(position - (SHIMMER_RISE + SHIMMER_FALL)) < 1e-9,
		);
		expect(brightness[gone]).toBeCloseTo(0);
		expect(brightness.at(-1)).toBeCloseTo(0);
	});

	test("the rise is eased: halfway in position is halfway in brightness", () => {
		const half = positions.findIndex(
			(position) => Math.abs(position - SHIMMER_RISE / 2) < 1e-9,
		);
		expect(brightness[half]).toBeCloseTo(0.5);
		// …and gentle at the start: a tenth of the way is far below a tenth.
		expect(brightness[1] ?? 1).toBeLessThan(0.05);
	});
});

test("the direction is a unit vector at 110°", () => {
	expect(Math.hypot(SHIMMER_DIRECTION.x, SHIMMER_DIRECTION.y)).toBeCloseTo(1);
	expect(SHIMMER_DIRECTION.x).toBeCloseTo(0.9397, 3);
	expect(SHIMMER_DIRECTION.y).toBeCloseTo(0.342, 3);
});
