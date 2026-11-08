import { useEffect, useId, useRef } from "react";
import {
	type LayoutChangeEvent,
	StyleSheet,
	Text,
	type TextInstance,
	type TextLayoutEvent,
	type TextProps,
} from "react-native";
import { useSkeleton } from "../context";
import { isShape, textLineToShape } from "../utils/shapes";

type TextLine = TextLayoutEvent["nativeEvent"]["lines"][number];

/** Drop-in `Text`. Inside a loading `<Skeleton>`, draws one bar per line. */
export default function BonesText({
	style,
	onLayout,
	onTextLayout,
	...props
}: TextProps) {
	const skeleton = useSkeleton();
	const id = useId();
	const ref = useRef<TextInstance>(null);
	const lines = useRef<readonly TextLine[]>([]);

	function measure() {
		const node = ref.current;
		const root = skeleton?.rootRef.current;
		if (!skeleton || !node || !root) return;
		node.measureLayout(root, (x, y) => {
			skeleton.setShapes(
				id,
				lines.current
					.map((line) => textLineToShape(line, x, y, skeleton.radius))
					.filter(isShape),
			);
		});
	}

	// Re-measure when the skeleton's layout changes (e.g. rotation).
	// biome-ignore lint/correctness/useExhaustiveDependencies: measure reads refs; layoutVersion is the trigger.
	useEffect(() => {
		measure();
	}, [skeleton?.layoutVersion]);

	// Remove this text's bars when it unmounts or the skeleton finishes.
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

	function handleTextLayout(event: TextLayoutEvent) {
		onTextLayout?.(event);
		lines.current = event.nativeEvent.lines;
		measure();
	}

	return (
		<Text
			ref={ref}
			{...props}
			style={skeleton ? [style, styles.hidden] : style}
			onLayout={skeleton ? handleLayout : onLayout}
			onTextLayout={skeleton ? handleTextLayout : onTextLayout}
		/>
	);
}

const styles = StyleSheet.create({
	// Keep the layout; hide the glyphs. Bars are drawn over this space.
	hidden: { color: "transparent" },
});
