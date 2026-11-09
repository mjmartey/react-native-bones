import {
	Canvas,
	Group,
	LinearGradient,
	Path,
	type SkColor,
	Skia,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
	type DerivedValue,
	type SharedValue,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useAnimationTime } from "../animation/clock";
import { boneOpacity, CSS_EASE } from "../animation/reveal";
import {
	APPEAR_DURATION,
	PULSE_DURATION,
	SHIMMER_DURATION,
	SHIMMER_PERIOD,
} from "../constants";
import type { HeldBone } from "../context";
import type { ShapeMap } from "../skeleton";
import type { BoneShape, BonesTheme } from "../types";
import type { RevealDelays } from "../utils/reveal-order";
import { SHIMMER_DIRECTION, shimmerStops } from "../utils/shimmer";

/** Lowest opacity of the pulse animation (it breathes between this and 1). */
const PULSE_MIN_OPACITY = 0.5;

type Point = { x: number; y: number };

/**
 * Draws the bars on one canvas: one path per piece (so each piece can fade
 * on its own during the reveal), all filled by the same repeating diagonal
 * gradient. The gradient is in *screen* coordinates (via `origin`), so the
 * bands run continuously across pieces and across separate skeletons.
 */
export default function BonesCanvas({
	groups,
	visible,
	fading,
	revealClock,
	revealDelays,
	held,
	origin,
	theme,
}: Readonly<{
	groups: ShapeMap;
	/** False while loading but before SHOW_DELAY: mounted, not shown. */
	visible: boolean;
	fading: boolean;
	revealClock: SharedValue<number>;
	revealDelays: RevealDelays;
	held: Readonly<Record<string, HeldBone>>;
	/** Where this skeleton sits on screen. */
	origin: Point;
	theme: BonesTheme;
}>) {
	const { colors, animation } = theme;
	const time = useAnimationTime(animation !== "none");

	const stops = useMemo(
		() => shimmerStops(colors.base, colors.highlight),
		[colors.base, colors.highlight],
	);

	// Shimmer: slide the repeating gradient along its own direction, one
	// repeat every SHIMMER_DURATION. The gradient line spans one repeat and
	// `mode="repeat"` tiles it; wrapping at one repeat keeps numbers small.
	const { width: screenWidth } = useWindowDimensions();
	const period = screenWidth * SHIMMER_PERIOD;
	const start = useDerivedValue(() => {
		"worklet";
		const travelled =
			((time.get() % SHIMMER_DURATION) / SHIMMER_DURATION) * period;
		return {
			x: SHIMMER_DIRECTION.x * travelled - origin.x,
			y: SHIMMER_DIRECTION.y * travelled - origin.y,
		};
	}, [time, period, origin.x, origin.y]);
	const end = useDerivedValue(() => {
		"worklet";
		const from = start.get();
		return {
			x: from.x + SHIMMER_DIRECTION.x * period,
			y: from.y + SHIMMER_DIRECTION.y * period,
		};
	}, [start, period]);

	// Pulse: a cosine wave, 1 → PULSE_MIN_OPACITY → 1 every PULSE_DURATION.
	const pulse = useDerivedValue(() => {
		"worklet";
		const phase = (time.get() % PULSE_DURATION) / PULSE_DURATION;
		const wave = (1 + Math.cos(phase * 2 * Math.PI)) / 2;
		return PULSE_MIN_OPACITY + (1 - PULSE_MIN_OPACITY) * wave;
	}, [time]);

	// Fade the skeleton in when it first shows, instead of popping it in.
	const appear = useSharedValue(visible ? 1 : 0);
	useEffect(() => {
		appear.set(
			visible
				? withTiming(1, { duration: APPEAR_DURATION, easing: CSS_EASE })
				: 0,
		);
	}, [visible, appear]);
	const groupOpacity = useDerivedValue(() => {
		"worklet";
		return appear.get() * (animation === "pulse" ? pulse.get() : 1);
	}, [appear, pulse, animation]);

	return (
		<Canvas style={styles.canvas}>
			<Group opacity={groupOpacity}>
				{Object.entries(groups)
					.filter(([id]) => !(id in held))
					.map(([id, shapes]) => (
						<BoneGroup
							key={id}
							shapes={shapes}
							color={colors.base}
							gradient={
								animation === "shimmer" ? { start, end, ...stops } : null
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
						gradient={animation === "shimmer" ? { start, end, ...stops } : null}
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
		colors: SkColor[];
		positions: number[];
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
		return fading ? boneOpacity(revealClock.get(), delay) : 1;
	}, [fading, revealClock, delay, contentOpacity]);

	return (
		<Path path={path} color={color} opacity={opacity}>
			{gradient ? (
				<LinearGradient
					start={gradient.start}
					end={gradient.end}
					colors={gradient.colors}
					positions={gradient.positions}
					mode="repeat"
				/>
			) : null}
		</Path>
	);
}

const styles = StyleSheet.create({
	// Taps pass through to whatever is underneath.
	canvas: { position: "absolute", inset: 0, pointerEvents: "none" },
});
