import { useEffect, useId, useRef } from "react";
import {
	type HostInstance,
	Image,
	type ImageProps,
	type LayoutChangeEvent,
	type NativeSyntheticEvent,
} from "react-native";
import Animated, {
	useAnimatedReaction,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { contentProgress } from "../animation/reveal";
import { REVEAL_DURATION } from "../constants";
import { type SkeletonContextValue, useSkeleton } from "../context";
import type { BoneShape } from "../types";
import { blockToShape, isShape } from "../utils/shapes";

/**
 * Drop-in `Image`. Inside a `<Skeleton>`, it becomes one bar while loading.
 * After the reveal, it keeps its bar until the image itself has loaded, then
 * fades in on its own. Give it a width and height (or aspectRatio) so it has
 * a shape before loading.
 */
export default function BonesImage(props: ImageProps) {
	const skeleton = useSkeleton();
	if (!skeleton) return <Image {...props} />;
	return <SkeletonImage {...props} skeleton={skeleton} />;
}

/** False when there is nothing to load (no source, or an empty uri). */
function hasImage(source: ImageProps["source"]): boolean {
	if (source == null) return false;
	if (typeof source !== "object" || !("uri" in source)) return true;
	return Boolean(source.uri);
}

function SkeletonImage({
	skeleton,
	style,
	source,
	onLayout,
	onLoad,
	onError,
	...props
}: ImageProps & { skeleton: SkeletonContextValue }) {
	const {
		measuring,
		rootRef,
		layoutVersion,
		radius,
		setShapes,
		setHeld,
		revealClock,
		revealPlan,
	} = skeleton;
	const id = useId();
	const ref = useRef<HostInstance>(null);
	const lastShapes = useRef<readonly BoneShape[]>([]);
	const delay = revealPlan.delays[id] ?? 0;
	const fade = revealPlan.fades[id] ?? revealPlan.fade;

	// 0 → 1 as the image arrives. No source means nothing to wait for.
	const hasSource = hasImage(source);
	const sourceKey = JSON.stringify(source ?? null);
	const imageProgress = useSharedValue(hasSource ? 0 : 1);

	// A new image (e.g. sample → real) has to load again.
	// biome-ignore lint/correctness/useExhaustiveDependencies: sourceKey is the trigger; hasSource derives from it.
	useEffect(() => {
		imageProgress.set(hasSource ? 0 : 1);
	}, [sourceKey]);

	function handleLoaded() {
		imageProgress.set(withTiming(1, { duration: REVEAL_DURATION }));
	}

	// The image shows only when both the reveal and the image have arrived.
	const contentOpacity = useDerivedValue(() => {
		"worklet";
		if (measuring) return 0;
		return Math.min(
			contentProgress(revealClock.get(), delay, fade),
			imageProgress.get(),
		);
	}, [measuring, revealClock, delay, fade, imageProgress]);
	const revealStyle = useAnimatedStyle(() => {
		"worklet";
		return { opacity: contentOpacity.get() };
	}, [contentOpacity]);

	function measure() {
		const node = ref.current;
		const root = rootRef.current;
		if (!node || !root) return;
		node.measureLayout(root, (x, y, width, height) => {
			const shapes = [blockToShape(x, y, width, height, style, radius)].filter(
				isShape,
			);
			lastShapes.current = shapes;
			setShapes(id, shapes);
		});
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: measure reads refs; these are the triggers.
	useEffect(() => {
		if (measuring) measure();
	}, [measuring, layoutVersion]);

	useEffect(() => () => setShapes(id, null), [setShapes, id]);

	// After loading, this image owns its bar: it stays until the image is in.
	useEffect(() => {
		if (measuring || lastShapes.current.length === 0) return;
		setHeld(id, { shapes: lastShapes.current, contentOpacity });
		return () => setHeld(id, null);
	}, [measuring, id, setHeld, contentOpacity]);

	// Once the image is fully shown, drop the bar (and the canvas, if it was
	// the last thing holding it).
	useAnimatedReaction(
		() => !measuring && contentOpacity.get() >= 1,
		(done, wasDone) => {
			if (done && !wasDone) scheduleOnRN(setHeld, id, null);
		},
		[measuring, contentOpacity, id, setHeld],
	);

	function handleLayout(event: LayoutChangeEvent) {
		onLayout?.(event);
		if (measuring) measure();
	}

	return (
		<Animated.Image
			ref={ref}
			{...props}
			source={source}
			style={[style, revealStyle]}
			onLayout={handleLayout}
			onLoad={(event) => {
				onLoad?.(event);
				handleLoaded();
			}}
			// A failed image still finishes its reveal, so no bar is left behind.
			onError={(event: NativeSyntheticEvent<{ error: string }>) => {
				onError?.(event);
				handleLoaded();
			}}
		/>
	);
}
