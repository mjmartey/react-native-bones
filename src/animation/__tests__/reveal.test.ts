import { describe, expect, test } from "bun:test";
import { boneOpacity, contentProgress, REVEAL_FINISHED } from "../reveal";

// A piece that starts 100 ms into the reveal and fades for 200 ms.
const DELAY = 100;
const FADE = 200;

describe("contentProgress", () => {
	test("hidden before its delay, fully in after its fade", () => {
		expect(contentProgress(0, DELAY, FADE)).toBe(0);
		expect(contentProgress(DELAY, DELAY, FADE)).toBe(0);
		expect(contentProgress(DELAY + FADE, DELAY, FADE)).toBe(1);
		expect(contentProgress(REVEAL_FINISHED, DELAY, FADE)).toBe(1);
	});

	test("eased with CSS `ease`: well past halfway at the midpoint", () => {
		const midpoint = contentProgress(DELAY + FADE / 2, DELAY, FADE);
		expect(midpoint).toBeCloseTo(0.8024, 3);
	});
});

test("bars fade out on exactly the opposite curve", () => {
	for (const clock of [0, 120, 150, 200, 260, 300]) {
		expect(boneOpacity(clock, DELAY, FADE)).toBeCloseTo(
			1 - contentProgress(clock, DELAY, FADE),
		);
	}
});
