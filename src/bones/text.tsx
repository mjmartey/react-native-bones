import { useEffect, useId, useRef } from "react";
import {
	type HostInstance,
	type LayoutChangeEvent,
	Text,
	type TextLayoutEvent,
	type TextProps,
} from "react-native";
import Animated from "react-native-reanimated";
import { type SkeletonContextValue, useSkeleton } from "../context";
import { isShape, textLineToShape } from "../utils/shapes";
import { useRevealStyle } from "./use-reveal-style";

type TextLine = TextLayoutEvent["nativeEvent"]["lines"][number];

/** Drop-in `Text`. Inside a `<Skeleton>`, draws one bar per line while loading. */
export default function BonesText(props: TextProps) {
	const skeleton = useSkeleton();
	// Outside a skeleton: a plain Text, no hooks, no animation, no cost.
	if (!skeleton) return <Text {...props} />;
	return <SkeletonText {...props} skeleton={skeleton} />;
}

function SkeletonText({
	skeleton,
	style,
	onLayout,
	onTextLayout,
	...props
}: TextProps & { skeleton: SkeletonContextValue }) {
	const { measuring, rootRef, layoutVersion, radius, setShapes } = skeleton;
	const id = useId();
	const ref = useRef<HostInstance>(null);
	const lines = useRef<readonly TextLine[]>([]);
	const revealStyle = useRevealStyle(skeleton, id);

	function measure() {
		const node = ref.current;
		const root = rootRef.current;
		if (!node || !root) return;
		node.measureLayout(root, (x, y) => {
			setShapes(
				id,
				lines.current
					.map((line) => textLineToShape(line, x, y, radius))
					.filter(isShape),
			);
		});
	}

	// Measure when loading starts and whenever the skeleton's layout changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: measure reads refs; these are the triggers.
	useEffect(() => {
		if (measuring) measure();
	}, [measuring, layoutVersion]);

	// Remove this text's bars when it unmounts.
	useEffect(() => () => setShapes(id, null), [setShapes, id]);

	function handleLayout(event: LayoutChangeEvent) {
		onLayout?.(event);
		if (measuring) measure();
	}

	function handleTextLayout(event: TextLayoutEvent) {
		onTextLayout?.(event);
		lines.current = event.nativeEvent.lines;
		if (measuring) measure();
	}

	return (
		<Animated.Text
			ref={ref}
			{...props}
			style={[style, revealStyle]}
			onLayout={handleLayout}
			onTextLayout={handleTextLayout}
		/>
	);
}
