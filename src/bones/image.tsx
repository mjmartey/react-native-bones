import { useEffect, useId, useRef } from "react";
import {
	type HostInstance,
	Image,
	type ImageProps,
	type LayoutChangeEvent,
} from "react-native";
import Animated from "react-native-reanimated";
import { type SkeletonContextValue, useSkeleton } from "../context";
import { blockToShape, isShape } from "../utils/shapes";
import { useRevealStyle } from "./use-reveal-style";

/**
 * Drop-in `Image`. Inside a `<Skeleton>`, it becomes one bar while loading.
 * Give it a width and height (or aspectRatio) so it has a shape before loading.
 */
export default function BonesImage(props: ImageProps) {
	const skeleton = useSkeleton();
	if (!skeleton) return <Image {...props} />;
	return <SkeletonImage {...props} skeleton={skeleton} />;
}

function SkeletonImage({
	skeleton,
	style,
	onLayout,
	...props
}: ImageProps & { skeleton: SkeletonContextValue }) {
	const { measuring, rootRef, layoutVersion, radius, setShapes } = skeleton;
	const id = useId();
	const ref = useRef<HostInstance>(null);
	const revealStyle = useRevealStyle(skeleton, id);

	function measure() {
		const node = ref.current;
		const root = rootRef.current;
		if (!node || !root) return;
		node.measureLayout(root, (x, y, width, height) => {
			setShapes(
				id,
				[blockToShape(x, y, width, height, style, radius)].filter(isShape),
			);
		});
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: measure reads refs; these are the triggers.
	useEffect(() => {
		if (measuring) measure();
	}, [measuring, layoutVersion]);

	useEffect(() => () => setShapes(id, null), [setShapes, id]);

	function handleLayout(event: LayoutChangeEvent) {
		onLayout?.(event);
		if (measuring) measure();
	}

	return (
		<Animated.Image
			ref={ref}
			{...props}
			style={[style, revealStyle]}
			onLayout={handleLayout}
		/>
	);
}
