import { StyleSheet, View } from "react-native";
import type { BoneShape } from "../types";

/**
 * Temporary overlay (Step 4.1): plain grey boxes so the measuring can be
 * checked. Step 4.2 replaces this with a single Skia canvas.
 */
export default function BonesOverlay({
	shapes,
}: Readonly<{ shapes: readonly BoneShape[] }>) {
	return (
		<View pointerEvents="none" style={StyleSheet.absoluteFill}>
			{shapes.map((shape) => (
				<View
					key={`${shape.x}:${shape.y}:${shape.width}:${shape.height}`}
					style={[
						styles.bone,
						{
							left: shape.x,
							top: shape.y,
							width: shape.width,
							height: shape.height,
							borderRadius: shape.radius,
						},
					]}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	bone: { position: "absolute", backgroundColor: "#E4E7EC" },
});
