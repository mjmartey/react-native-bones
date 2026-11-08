import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { DEFAULT_COLORS } from "../constants";
import type { BoneShape } from "../types";

/**
 * Draws every bar as one Skia path on one canvas. Because all bars are a
 * single shape, one gradient can later fill them all (the synced shimmer).
 */
export default function BonesCanvas({
	shapes,
}: Readonly<{ shapes: readonly BoneShape[] }>) {
	const path = useMemo(() => {
		const builder = Skia.PathBuilder.Make();
		for (const bone of shapes) {
			builder.addRRect(
				Skia.RRectXY(
					Skia.XYWHRect(bone.x, bone.y, bone.width, bone.height),
					bone.radius,
					bone.radius,
				),
			);
		}
		return builder.build();
	}, [shapes]);

	return (
		<Canvas style={styles.canvas}>
			<Path path={path} color={DEFAULT_COLORS.base} />
		</Canvas>
	);
}

const styles = StyleSheet.create({
	// Taps pass through to whatever is underneath.
	canvas: { position: "absolute", inset: 0, pointerEvents: "none" },
});
