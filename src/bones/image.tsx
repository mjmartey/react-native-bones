import { useEffect, useId, useRef } from "react";
import {
	type HostInstance,
	Image,
	type ImageProps,
	type LayoutChangeEvent,
	StyleSheet,
} from "react-native";
import { useSkeleton } from "../context";
import { blockToShape, isShape } from "../utils/shapes";

/**
 * Drop-in `Image`. Inside a loading `<Skeleton>`, it becomes one bar.
 * Give it a width and height (or aspectRatio) so it has a shape before loading.
 */
export default function BonesImage({ style, onLayout, ...props }: ImageProps) {
	const skeleton = useSkeleton();
	const id = useId();
	const ref = useRef<HostInstance>(null);

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
		<Image
			ref={ref}
			{...props}
			style={skeleton ? [style, styles.hidden] : style}
			onLayout={skeleton ? handleLayout : onLayout}
		/>
	);
}

const styles = StyleSheet.create({
	hidden: { opacity: 0 },
});
