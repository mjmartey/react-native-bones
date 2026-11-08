import { Canvas, LinearGradient, Path, Skia } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useDerivedValue } from "react-native-reanimated";
import { useShimmerClock } from "../animation/clock";
import { DEFAULT_COLORS, SHIMMER_BAND } from "../constants";
import type { BoneShape } from "../types";

const GRADIENT_COLORS = [
	DEFAULT_COLORS.base,
	DEFAULT_COLORS.highlight,
	DEFAULT_COLORS.base,
];

/**
 * Draws every bar as one Skia path on one canvas, filled by one moving
 * gradient. The gradient is positioned in *screen* coordinates (via
 * `originX`), so bands line up across separate skeletons too.
 */
export default function BonesCanvas({
	shapes,
	originX,
}: Readonly<{ shapes: readonly BoneShape[]; originX: number }>) {
	const progress = useShimmerClock();
	const { width: screenWidth } = useWindowDimensions();
	const band = screenWidth * SHIMMER_BAND;

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

	// The band's left edge travels from fully off-screen left (-band) to
	// fully off-screen right (screenWidth). Runs on the UI thread every frame.
	const start = useDerivedValue(() => {
		"worklet";
		return {
			x: -band + progress.get() * (screenWidth + band) - originX,
			y: 0,
		};
	}, [band, screenWidth, originX, progress]);
	const end = useDerivedValue(() => {
		"worklet";
		return { x: start.get().x + band, y: 0 };
	}, [band, start]);

	return (
		<Canvas style={styles.canvas}>
			<Path path={path} color={DEFAULT_COLORS.base}>
				<LinearGradient start={start} end={end} colors={GRADIENT_COLORS} />
			</Path>
		</Canvas>
	);
}

const styles = StyleSheet.create({
	// Taps pass through to whatever is underneath.
	canvas: { position: "absolute", inset: 0, pointerEvents: "none" },
});
