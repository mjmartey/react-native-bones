import { useEffect, useId, useRef } from "react";
import {
	type HostInstance,
	type LayoutChangeEvent,
	View,
	type ViewProps,
} from "react-native";
import Animated from "react-native-reanimated";
import { type SkeletonContextValue, useSkeleton } from "../context";
import { blockToShape, isShape } from "../utils/shapes";
import { useRevealStyle } from "./use-reveal-style";

/**
 * Drop-in `View` for painted boxes (buttons, chips, avatars). Inside a
 * `<Skeleton>`, it and everything in it become one bar while loading.
 */
export default function BonesView(props: ViewProps) {
	const skeleton = useSkeleton();
	if (!skeleton) return <View {...props} />;
	return <SkeletonView {...props} skeleton={skeleton} />;
}

function SkeletonView({
	skeleton,
	style,
	onLayout,
	...props
}: ViewProps & { skeleton: SkeletonContextValue }) {
	const { measuring, rootRef, layoutVersion, radius, setShapes } = skeleton;
	const id = useId();
	const ref = useRef<HostInstance>(null);
	const revealStyle = useRevealStyle(skeleton);

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
		<Animated.View
			ref={ref}
			collapsable={false}
			{...props}
			style={[style, revealStyle]}
			onLayout={handleLayout}
		/>
	);
}
