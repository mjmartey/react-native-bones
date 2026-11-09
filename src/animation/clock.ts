import { useEffect } from "react";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";

/**
 * The current frame's timestamp, in milliseconds, like Skullet's document
 * clock. Every canvas reads the same timestamp in the same frame, so all
 * skeletons are in step without sharing any state, and the phase never
 * resets: a skeleton that mounts (or remounts) late simply joins wherever
 * the animation already is.
 */
export function useAnimationTime(enabled: boolean) {
	const time = useSharedValue(0);
	const frame = useFrameCallback((info) => {
		"worklet";
		time.set(info.timestamp);
	}, false);

	// Only tick while something animates; a still or finished skeleton costs
	// no frames.
	useEffect(() => {
		frame.setActive(enabled);
		return () => frame.setActive(false);
	}, [enabled, frame]);

	return time;
}
