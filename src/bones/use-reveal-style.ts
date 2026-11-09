import { useAnimatedStyle } from "react-native-reanimated";
import { contentProgress } from "../animation/reveal";
import type { SkeletonContextValue } from "../context";

/**
 * Opacity for a primitive's own content: hidden while measuring, then fading
 * in on the reveal clock (after its own delay), as its bars fade out.
 */
export function useRevealStyle(
	{ measuring, revealClock, revealDelays }: SkeletonContextValue,
	id: string,
) {
	const delay = revealDelays[id] ?? 0;
	return useAnimatedStyle(() => {
		"worklet";
		return {
			opacity: measuring ? 0 : contentProgress(revealClock.get(), delay),
		};
	}, [measuring, revealClock, delay]);
}
