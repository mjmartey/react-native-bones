import { Canvas, LinearGradient, Path, Skia } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useDerivedValue } from "react-native-reanimated";
import { useShimmerClock } from "../animation/clock";
import { SHIMMER_BAND } from "../constants";
import type { BoneShape, BonesTheme } from "../types";

/** Lowest opacity of the pulse animation (it breathes between this and 1). */
const PULSE_MIN_OPACITY = 0.5;

/**
 * Draws every bar as one Skia path on one canvas. With `shimmer`, one moving
 * gradient fills it, positioned in *screen* coordinates (via `originX`) so
 * bands line up across separate skeletons. With `pulse`, the whole path
 * fades in and out together.
 */
export default function BonesCanvas({
	shapes,
	originX,
	theme,
}: Readonly<{
	shapes: readonly BoneShape[];
	originX: number;
	theme: BonesTheme;
}>) {
	const { colors, animation } = theme;
	const progress = useShimmerClock(animation !== "none");
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

	const gradientColors = useMemo(
		() => [colors.base, colors.highlight, colors.base],
		[colors.base, colors.highlight],
	);

	// Shimmer: the band's left edge travels from fully off-screen left (-band)
	// to fully off-screen right (screenWidth). Runs on the UI thread.
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

	// Pulse: a cosine wave, 1 → PULSE_MIN_OPACITY → 1 over one clock cycle.
	const opacity = useDerivedValue(() => {
		"worklet";
		const wave = (1 + Math.cos(progress.get() * 2 * Math.PI)) / 2;
		return PULSE_MIN_OPACITY + (1 - PULSE_MIN_OPACITY) * wave;
	}, [progress]);

	return (
		<Canvas style={styles.canvas}>
			{animation === "shimmer" ? (
				<Path path={path} color={colors.base}>
					<LinearGradient start={start} end={end} colors={gradientColors} />
				</Path>
			) : (
				<Path
					path={path}
					color={colors.base}
					opacity={animation === "pulse" ? opacity : 1}
				/>
			)}
		</Canvas>
	);
}

const styles = StyleSheet.create({
	// Taps pass through to whatever is underneath.
	canvas: { position: "absolute", inset: 0, pointerEvents: "none" },
});
