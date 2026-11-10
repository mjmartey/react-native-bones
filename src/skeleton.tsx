import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HostInstance } from "react-native";
import Animated, {
	Easing,
	LinearTransition,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { REVEAL_FINISHED } from "./animation/reveal";
import BonesCanvas from "./components/bones-canvas";
import { RESIZE_DURATION, SHOW_DELAY } from "./constants";
import {
	type HeldBone,
	SkeletonContext,
	type SkeletonContextValue,
} from "./context";
import { useBonesTheme } from "./theme";
import type { BoneShape, SkeletonProps } from "./types";
import { EMPTY_PLAN, planReveal, type RevealPlan } from "./utils/reveal-order";
import { sameShapes } from "./utils/shapes";

export type ShapeMap = Readonly<Record<string, readonly BoneShape[]>>;

/** Size changes (sample → real content) ease instead of snapping. */
const RESIZE = LinearTransition.duration(RESIZE_DURATION).easing(
	Easing.bezier(0.2, 0, 0, 1),
);

export default function Skeleton<T>({
	data,
	sample,
	loading = false,
	children,
	style,
	label = "Loading",
	onReveal,
}: SkeletonProps<T>) {
	// The phone's "Reduce Motion" setting: still bars, instant reveals.
	const reducedMotion = useReducedMotion();
	const isLoading = loading || data == null;
	const theme = useBonesTheme();
	const rootRef = useRef<HostInstance>(null);
	const [layoutVersion, setLayoutVersion] = useState(0);
	const [origin, setOrigin] = useState({ x: 0, y: 0 });
	const [shapes, setShapeMap] = useState<ShapeMap>({});
	// Bars appear only after SHOW_DELAY of loading.
	const [barsVisible, setBarsVisible] = useState(false);
	// While revealing: the last bars per piece, kept on screen as they fade.
	const [fading, setFading] = useState<ShapeMap | null>(null);
	// When each piece starts its reveal (empty for `together`: all at 0).
	const [plan, setPlan] = useState<RevealPlan>(EMPTY_PLAN);
	// Bars kept after loading by pieces that aren't ready (images).
	const [held, setHeldMap] = useState<Readonly<Record<string, HeldBone>>>({});

	const setHeld = useCallback((id: string, next: HeldBone | null) => {
		setHeldMap((current) => {
			if (next === null) {
				if (!(id in current)) return current;
				return Object.fromEntries(
					Object.entries(current).filter(([key]) => key !== id),
				);
			}
			return { ...current, [id]: next };
		});
	}, []);
	// Milliseconds into the reveal. Content fades in and bars fade out from it.
	const revealClock = useSharedValue(isLoading ? 0 : REVEAL_FINISHED);

	const setShapes = useCallback(
		(id: string, next: readonly BoneShape[] | null) => {
			setShapeMap((current) => {
				if (next === null) {
					if (!(id in current)) return current;
					return Object.fromEntries(
						Object.entries(current).filter(([key]) => key !== id),
					);
				}
				if (sameShapes(current[id], next)) return current;
				return { ...current, [id]: next };
			});
		},
		[],
	);

	const context = useMemo<SkeletonContextValue>(
		() => ({
			measuring: isLoading,
			rootRef,
			layoutVersion,
			radius: theme.radius,
			setShapes,
			revealClock,
			revealPlan: plan,
			setHeld,
		}),
		[
			isLoading,
			layoutVersion,
			theme.radius,
			setShapes,
			revealClock,
			plan,
			setHeld,
		],
	);

	// When loading stops, snapshot the bars *in this render*, not in an effect.
	// React re-renders straight away with the snapshot, so the first frame on
	// screen already has it: no frame without bars, no canvas remount.
	// (React's "storing information from previous renders" pattern.)
	const [wasLoading, setWasLoading] = useState(isLoading);
	// Whether the content that just arrived replaced bars on screen.
	const [overSkeleton, setOverSkeleton] = useState(false);
	if (wasLoading !== isLoading) {
		setWasLoading(isLoading);
		if (isLoading) {
			setFading(null);
			setPlan(EMPTY_PLAN);
			setOverSkeleton(false);
		} else {
			setBarsVisible(false);
			setShapeMap({});
			setOverSkeleton(barsVisible);
			// Only bars that were on screen get a reveal; fast data shows at
			// once, and so does everything under reduced motion.
			if (barsVisible && !reducedMotion) {
				setFading(shapes);
				setPlan(planReveal(shapes, theme.reveal, origin));
			}
		}
	}

	// Timers and the reveal clock, once that render is committed. It reads
	// fading and delays from the snapshot above.
	// biome-ignore lint/correctness/useExhaustiveDependencies: isLoading is the only trigger.
	useEffect(() => {
		if (isLoading) {
			revealClock.set(0);
			const timer = setTimeout(() => setBarsVisible(true), SHOW_DELAY);
			return () => clearTimeout(timer);
		}

		if (!fading) {
			revealClock.set(REVEAL_FINISHED);
			if (overSkeleton) onReveal?.();
			return;
		}

		// Each piece's content fades in while its bars fade out, both reading
		// this clock from that piece's delay (all 0 for `together`).
		const { total } = plan;
		revealClock.set(0);
		revealClock.set(
			withTiming(total, {
				duration: total,
				easing: Easing.linear,
			}),
		);
		const timer = setTimeout(() => {
			setFading(null);
			onReveal?.();
		}, total);
		return () => clearTimeout(timer);
	}, [isLoading]);

	function handleLayout() {
		setLayoutVersion((version) => version + 1);
		// Where this skeleton sits on screen, so its shimmer lines up with others.
		rootRef.current?.measureInWindow((x, y) => setOrigin({ x, y }));
	}

	// Loading: the live bars. The canvas mounts as loading starts, hidden until
	// SHOW_DELAY passes, so Skia's surface is ready before the bars show.
	// After: the fading copy during the reveal, plus bars held by images.
	const groups = isLoading
		? shapes
		: fading || Object.keys(held).length > 0
			? (fading ?? {})
			: null;
	const content = !isLoading && data != null ? data : sample;

	return (
		<Animated.View
			ref={rootRef}
			layout={reducedMotion ? undefined : RESIZE}
			collapsable={false}
			style={style}
			onLayout={handleLayout}
			// While loading, the skeleton is one element: its label is read and
			// it is marked busy; the hidden sample content is never read out.
			accessible={isLoading}
			accessibilityLabel={isLoading ? label : undefined}
			accessibilityState={isLoading ? { busy: true } : undefined}
		>
			<SkeletonContext value={context}>{children(content)}</SkeletonContext>
			{groups ? (
				<BonesCanvas
					groups={groups}
					visible={!isLoading || barsVisible}
					fading={!isLoading}
					revealClock={revealClock}
					revealPlan={plan}
					held={isLoading ? {} : held}
					origin={origin}
					theme={theme}
					reducedMotion={reducedMotion}
				/>
			) : null}
		</Animated.View>
	);
}
