import { useAnimatedStyle } from "react-native-reanimated";
import { pieceProgress } from "../animation/reveal";
import type { SkeletonContextValue } from "../context";

/**
 * Opacity for a primitive's own content: hidden while measuring, then fading
 * in on the reveal clock, at the same moment its bars fade out.
 */
export function useRevealStyle({
	measuring,
	revealClock,
}: SkeletonContextValue) {
	return useAnimatedStyle(() => {
		"worklet";
		return { opacity: measuring ? 0 : pieceProgress(revealClock.get(), 0) };
	}, [measuring, revealClock]);
}
