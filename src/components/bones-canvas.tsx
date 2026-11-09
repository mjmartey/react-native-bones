import {
	Canvas,
	Group,
	LinearGradient,
	Path,
	Skia,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
	type DerivedValue,
	type SharedValue,
	useDerivedValue,
} from "react-native-reanimated";
import { useShimmerClock } from "../animation/clock";
import { pieceProgress } from "../animation/reveal";
import { SHIMMER_BAND } from "../constants";
import type { HeldBone } from "../context";
import type { ShapeMap } from "../skeleton";
import type { BoneShape, BonesTheme } from "../types";
import type { RevealDelays } from "../utils/reveal-order";

/** Lowest opacity of the pulse animation (it breathes between this and 1). */
const PULSE_MIN_OPACITY = 0.5;

type Point = { x: number; y: number };

/**
 * Draws the bars on one canvas: one path per piece (so each piece can fade
 * on its own during the reveal), all filled by the same moving gradient.
 * The gradient is in *screen* coordinates (via `originX`), so the shimmer
 * stays one continuous band across pieces and across separate skeletons.
 */
export default function BonesCanvas({
	groups,
	fading,
	revealClock,
	revealDelays,
	held,
	originX,
	theme,
}: Readonly<{
	groups: ShapeMap;
	fading: boolean;
	revealClock: SharedValue<number>;
	revealDelays: RevealDelays;
	held: Readonly<Record<string, HeldBone>>;
	originX: number;
	theme: BonesTheme;
}>) {
	const { colors, animation } = theme;
	const progress = useShimmerClock(animation !== "none");
	const { width: screenWidth } = useWindowDimensions();
	const band = screenWidth * SHIMMER_BAND;

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
	const pulse = useDerivedValue(() => {
		"worklet";
		const wave = (1 + Math.cos(progress.get() * 2 * Math.PI)) / 2;
		return PULSE_MIN_OPACITY + (1 - PULSE_MIN_OPACITY) * wave;
	}, [progress]);

	return (
		<Canvas style={styles.canvas}>
			<Group opacity={animation === "pulse" ? pulse : 1}>
				{Object.entries(groups)
					.filter(([id]) => !(id in held))
					.map(([id, shapes]) => (
						<BoneGroup
							key={id}
							shapes={shapes}
							color={colors.base}
							gradient={
								animation === "shimmer"
									? { start, end, colors: gradientColors }
									: null
							}
							fading={fading}
							revealClock={revealClock}
							delay={revealDelays[id] ?? 0}
						/>
					))}
				{Object.entries(held).map(([id, { shapes, contentOpacity }]) => (
					<BoneGroup
						key={`held:${id}`}
						shapes={shapes}
						color={colors.base}
						gradient={
							animation === "shimmer"
								? { start, end, colors: gradientColors }
								: null
						}
						fading={false}
						revealClock={revealClock}
						delay={0}
						contentOpacity={contentOpacity}
					/>
				))}
			</Group>
		</Canvas>
	);
}

/** One piece's bars. Fades out on the reveal clock as its content fades in. */
function BoneGroup({
	shapes,
	color,
	gradient,
	fading,
	revealClock,
	delay,
	contentOpacity,
}: Readonly<{
	shapes: readonly BoneShape[];
	color: string;
	gradient: {
		start: DerivedValue<Point>;
		end: DerivedValue<Point>;
		colors: string[];
	} | null;
	fading: boolean;
	revealClock: SharedValue<number>;
	delay: number;
	/** A held bar fades as its piece appears: opacity is 1 minus this. */
	contentOpacity?: DerivedValue<number>;
}>) {
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

	const opacity = useDerivedValue(() => {
		"worklet";
		if (contentOpacity) return 1 - contentOpacity.get();
		return fading ? 1 - pieceProgress(revealClock.get(), delay) : 1;
	}, [fading, revealClock, delay, contentOpacity]);

	return (
		<Path path={path} color={color} opacity={opacity}>
			{gradient ? (
				<LinearGradient
					start={gradient.start}
					end={gradient.end}
					colors={gradient.colors}
				/>
			) : null}
		</Path>
	);
}

const styles = StyleSheet.create({
	// Taps pass through to whatever is underneath.
	canvas: { position: "absolute", inset: 0, pointerEvents: "none" },
});
