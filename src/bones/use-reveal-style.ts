import { useAnimatedStyle } from "react-native-reanimated";
import { contentProgress } from "../animation/reveal";
import type { SkeletonContextValue } from "../context";

/**
 * Opacity for a primitive's own content: hidden while measuring, then fading
 * in on the reveal clock (after its own delay), as its bars fade out.
 */
export function useRevealStyle(
	{ measuring, revealClock, revealPlan }: SkeletonContextValue,
	id: string,
) {
	const delay = revealPlan.delays[id] ?? 0;
	const fade = revealPlan.fades[id] ?? revealPlan.fade;
	return useAnimatedStyle(() => {
		"worklet";
		return {
			opacity: measuring ? 0 : contentProgress(revealClock.get(), delay, fade),
		};
	}, [measuring, revealClock, delay, fade]);
}
