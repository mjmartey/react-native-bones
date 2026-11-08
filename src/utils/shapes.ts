import {
	type StyleProp,
	StyleSheet,
	type TextLayoutEvent,
	type ViewStyle,
} from "react-native";
import { TEXT_HEIGHT_PER_CAP_HEIGHT } from "../constants";
import type { BoneShape } from "../types";

type TextLine = TextLayoutEvent["nativeEvent"]["lines"][number];

/**
 * Turns one laid-out line of text into a bar the height of the glyphs,
 * centred in the line box. With a custom lineHeight, iOS adds the extra
 * space to ascender and descender, so the size comes from capHeight instead.
 */
export function textLineToShape(
	line: TextLine,
	originX: number,
	originY: number,
	radius: number,
): BoneShape | null {
	if (line.width <= 0 || line.text.trim() === "") return null;
	const textHeight =
		line.capHeight > 0
			? line.capHeight * TEXT_HEIGHT_PER_CAP_HEIGHT
			: line.ascender + line.descender;
	const height =
		textHeight > 0 ? Math.min(textHeight, line.height) : line.height;
	return {
		x: originX + line.x,
		y: originY + line.y + (line.height - height) / 2,
		width: line.width,
		height,
		radius: Math.min(radius, height / 2),
	};
}

/** A whole element as one bar, keeping its own corner radius when it has one. */
export function blockToShape(
	x: number,
	y: number,
	width: number,
	height: number,
	style: StyleProp<ViewStyle>,
	fallbackRadius: number,
): BoneShape | null {
	if (width <= 0 || height <= 0) return null;
	const flat = StyleSheet.flatten(style);
	const radius =
		typeof flat?.borderRadius === "number" ? flat.borderRadius : fallbackRadius;
	return { x, y, width, height, radius: Math.min(radius, height / 2) };
}

export function isShape(shape: BoneShape | null): shape is BoneShape {
	return shape !== null;
}

export function sameShapes(
	a: readonly BoneShape[] | undefined,
	b: readonly BoneShape[],
): boolean {
	if (!a || a.length !== b.length) return false;
	return a.every((shape, index) => {
		const other = b[index];
		return (
			other !== undefined &&
			shape.x === other.x &&
			shape.y === other.y &&
			shape.width === other.width &&
			shape.height === other.height &&
			shape.radius === other.radius
		);
	});
}
