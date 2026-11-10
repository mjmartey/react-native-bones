import { describe, expect, test } from "bun:test";
import type { TextLayoutEvent } from "react-native";
import { blockToShape, sameShapes, textLineToShape } from "../shapes";

type TextLine = TextLayoutEvent["nativeEvent"]["lines"][number];

// Real numbers logged from an iPhone: SF Pro at 15pt, without and with
// `lineHeight: 22`. iOS adds the extra line space to ascender and
// descender, but capHeight stays the same.
const PLAIN: TextLine = {
	text: "GH₵ 240.00",
	x: 0,
	y: 0,
	width: 120,
	height: 17.900390625,
	ascender: 14.2822265625,
	descender: 3.6181640625,
	capHeight: 10.56884765625,
	xHeight: 8.00537109375,
};
const TALL: TextLine = {
	...PLAIN,
	text: "Helps customers",
	height: 22,
	ascender: 16.33203125,
	descender: 5.66796875,
};

describe("textLineToShape", () => {
	test("a line without lineHeight fills its line box", () => {
		const shape = textLineToShape(PLAIN, 10, 20, 4);
		expect(shape).toEqual({
			x: 10,
			y: 20,
			width: 120,
			height: PLAIN.height,
			radius: 4,
		});
	});

	test("with lineHeight, the bar is sized from capHeight and centred", () => {
		const shape = textLineToShape(TALL, 0, 0, 4);
		const height = TALL.capHeight * 1.7; // ≈ 17.97, the font's own height
		expect(shape?.height).toBeCloseTo(height);
		expect(shape?.y).toBeCloseTo((22 - height) / 2);
	});

	test("falls back to ascender + descender without a capHeight", () => {
		const shape = textLineToShape({ ...PLAIN, capHeight: 0 }, 0, 0, 4);
		expect(shape?.height).toBeCloseTo(PLAIN.ascender + PLAIN.descender);
	});

	test("never rounds more than half the bar's height", () => {
		expect(textLineToShape(PLAIN, 0, 0, 50)?.radius).toBeCloseTo(
			PLAIN.height / 2,
		);
	});

	test("skips blank and empty lines", () => {
		expect(textLineToShape({ ...PLAIN, text: "   " }, 0, 0, 4)).toBeNull();
		expect(textLineToShape({ ...PLAIN, width: 0 }, 0, 0, 4)).toBeNull();
	});
});

describe("blockToShape", () => {
	test("keeps the element's own borderRadius, from a style array", () => {
		const style = [{ borderRadius: 28 }, { opacity: 1 }];
		expect(blockToShape(0, 0, 56, 56, style, 4)?.radius).toBe(28);
	});

	test("uses the fallback radius when the style has none", () => {
		expect(blockToShape(0, 0, 100, 40, undefined, 4)?.radius).toBe(4);
	});

	test("a pill (borderRadius 999) is capped at half its height", () => {
		expect(blockToShape(0, 0, 80, 24, { borderRadius: 999 }, 4)?.radius).toBe(
			12,
		);
	});

	test("nothing to draw for a zero-size element", () => {
		expect(blockToShape(0, 0, 0, 40, undefined, 4)).toBeNull();
	});
});

describe("sameShapes", () => {
	const shape = { x: 1, y: 2, width: 3, height: 4, radius: 1 };

	test("equal lists match", () => {
		expect(sameShapes([shape], [{ ...shape }])).toBe(true);
	});

	test("any difference, or no previous list, does not", () => {
		expect(sameShapes([shape], [{ ...shape, x: 9 }])).toBe(false);
		expect(sameShapes(undefined, [shape])).toBe(false);
		expect(sameShapes([shape], [])).toBe(false);
	});
});
