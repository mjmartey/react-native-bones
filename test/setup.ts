/**
 * Test setup. The functions we test are plain TypeScript, but the files
 * they live in import React Native, Skia and Reanimated, which need a
 * phone (native code) to load. Bun can't load them, so before any test
 * runs we replace each with a small fake exposing only what's used.
 */
import { mock } from "bun:test";
// Reanimated's easing code is plain JavaScript (no native parts), so the
// tests use the real thing rather than a copy.
import { Easing } from "react-native-reanimated/lib/module/Easing.js";

type Style = Record<string, unknown> | false | null | undefined | Style[];

/** React Native's StyleSheet.flatten: merge nested style arrays, left to right. */
function flatten(style: Style): Record<string, unknown> {
	if (!style) return {};
	if (Array.isArray(style)) {
		return Object.assign({}, ...style.map((item) => flatten(item)));
	}
	return style;
}

/** Skia.Color for the formats our tests use: "#RRGGBB" and "transparent". */
function color(value: string): Float32Array {
	if (value === "transparent") return Float32Array.of(0, 0, 0, 0);
	const hex = value.replace("#", "");
	const channel = (index: number) =>
		Number.parseInt(hex.slice(index, index + 2), 16) / 255;
	return Float32Array.of(channel(0), channel(2), channel(4), 1);
}

mock.module("react-native", () => ({ StyleSheet: { flatten } }));
mock.module("@shopify/react-native-skia", () => ({ Skia: { Color: color } }));
mock.module("react-native-reanimated", () => ({ Easing }));
