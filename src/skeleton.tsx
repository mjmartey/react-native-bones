import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View, type ViewInstance } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { REVEAL_FINISHED } from "./animation/reveal";
import BonesCanvas from "./components/bones-canvas";
import { REVEAL_DURATION, SHOW_DELAY } from "./constants";
import {
	type HeldBone,
	SkeletonContext,
	type SkeletonContextValue,
} from "./context";
import { useBonesTheme } from "./theme";
import type { BoneShape, SkeletonProps } from "./types";
import {
	longestDelay,
	type RevealDelays,
	revealDelays,
} from "./utils/reveal-order";
import { sameShapes } from "./utils/shapes";

export type ShapeMap = Readonly<Record<string, readonly BoneShape[]>>;

export default function Skeleton<T>({
	data,
	sample,
	loading = false,
	children,
	style,
}: SkeletonProps<T>) {
	const isLoading = loading || data == null;
	const theme = useBonesTheme();
	const rootRef = useRef<ViewInstance>(null);
	const [layoutVersion, setLayoutVersion] = useState(0);
	const [originX, setOriginX] = useState(0);
	const [shapes, setShapeMap] = useState<ShapeMap>({});
	// Bars appear only after SHOW_DELAY of loading.
	const [barsVisible, setBarsVisible] = useState(false);
	// While revealing: the last bars per piece, kept on screen as they fade.
	const [fading, setFading] = useState<ShapeMap | null>(null);
	// When each piece starts its reveal (empty for `together`: all at 0).
	const [delays, setDelays] = useState<RevealDelays>({});
	const { width: screenWidth } = useWindowDimensions();
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
			revealDelays: delays,
			setHeld,
		}),
		[
			isLoading,
			layoutVersion,
			theme.radius,
			setShapes,
			revealClock,
			delays,
			setHeld,
		],
	);

	// When loading stops, snapshot the bars *in this render*, not in an effect.
	// React re-renders straight away with the snapshot, so the first frame on
	// screen already has it: no frame without bars, no canvas remount.
	// (React's "storing information from previous renders" pattern.)
	const [wasLoading, setWasLoading] = useState(isLoading);
	if (wasLoading !== isLoading) {
		setWasLoading(isLoading);
		if (isLoading) {
			setFading(null);
			setDelays({});
		} else {
			setBarsVisible(false);
			setShapeMap({});
			// Only bars that were on screen get a reveal; fast data shows at once.
			if (barsVisible) {
				setFading(shapes);
				setDelays(revealDelays(shapes, theme.reveal, originX, screenWidth));
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
			return;
		}

		// Each piece's content fades in while its bars fade out, both reading
		// this clock from that piece's delay (all 0 for `together`).
		const total = longestDelay(delays) + REVEAL_DURATION;
		revealClock.set(0);
		revealClock.set(
			withTiming(total, { duration: total, easing: Easing.linear }),
		);
		const timer = setTimeout(() => setFading(null), total);
		return () => clearTimeout(timer);
	}, [isLoading]);

	function handleLayout() {
		setLayoutVersion((version) => version + 1);
		// Where this skeleton sits on screen, so its shimmer lines up with others.
		rootRef.current?.measureInWindow((x) => setOriginX(x));
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
		<View
			ref={rootRef}
			collapsable={false}
			style={style}
			onLayout={handleLayout}
		>
			<SkeletonContext value={context}>{children(content)}</SkeletonContext>
			{groups ? (
				<BonesCanvas
					groups={groups}
					visible={!isLoading || barsVisible}
					fading={!isLoading}
					revealClock={revealClock}
					revealDelays={delays}
					held={isLoading ? {} : held}
					originX={originX}
					theme={theme}
				/>
			) : null}
		</View>
	);
}
