import { useEffect, useId, useRef } from "react";
import {
	type LayoutChangeEvent,
	StyleSheet,
	View,
	type ViewInstance,
	type ViewProps,
} from "react-native";
import { useSkeleton } from "../context";
import { blockToShape, isShape } from "../utils/shapes";

/**
 * Drop-in `View` for painted boxes (buttons, chips, avatars). Inside a loading
 * `<Skeleton>`, it and everything in it become one bar.
 */
export default function BonesView({ style, onLayout, ...props }: ViewProps) {
	const skeleton = useSkeleton();
	const id = useId();
	const ref = useRef<ViewInstance>(null);

	function measure() {
		const node = ref.current;
		const root = skeleton?.rootRef.current;
		if (!skeleton || !node || !root) return;
		node.measureLayout(root, (x, y, width, height) => {
			skeleton.setShapes(
				id,
				[blockToShape(x, y, width, height, style, skeleton.radius)].filter(
					isShape,
				),
			);
		});
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: measure reads refs; layoutVersion is the trigger.
	useEffect(() => {
		measure();
	}, [skeleton?.layoutVersion]);

	// Depends only on the stable setShapes, so re-measures never clear the bars.
	const setShapes = skeleton?.setShapes;
	useEffect(() => {
		if (!setShapes) return;
		return () => setShapes(id, null);
	}, [setShapes, id]);

	function handleLayout(event: LayoutChangeEvent) {
		onLayout?.(event);
		measure();
	}

	return (
		<View
			ref={ref}
			collapsable={false}
			{...props}
			style={skeleton ? [style, styles.hidden] : style}
			onLayout={skeleton ? handleLayout : onLayout}
		/>
	);
}

const styles = StyleSheet.create({
	hidden: { opacity: 0 },
});
