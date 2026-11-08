import { useEffect } from "react";
import {
	cancelAnimation,
	Easing,
	makeMutable,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { SHIMMER_DURATION } from "../constants";

/**
 * One clock for the whole app, going 0 → 1 on repeat. Every skeleton reads
 * the same value, so a skeleton that mounts mid-sweep joins in step with the
 * ones already on screen instead of starting its own sweep.
 */
const progress = makeMutable(0);
let subscribers = 0;

export function useShimmerClock() {
	useEffect(() => {
		subscribers += 1;
		if (subscribers === 1) {
			progress.set(0);
			progress.set(
				withRepeat(
					withTiming(1, { duration: SHIMMER_DURATION, easing: Easing.linear }),
					-1,
				),
			);
		}
		return () => {
			subscribers -= 1;
			// Nothing is loading: stop ticking so no frames are spent.
			if (subscribers === 0) cancelAnimation(progress);
		};
	}, []);

	return progress;
}
