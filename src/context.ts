import { createContext, type RefObject, useContext } from "react";
import type { HostInstance } from "react-native";
import type { DerivedValue, SharedValue } from "react-native-reanimated";
import type { BoneShape } from "./types";
import type { RevealPlan } from "./utils/reveal-order";

/**
 * A bar kept on screen after loading by a piece that isn't ready yet (an
 * image still downloading). Drawn at `1 - contentOpacity`, so it fades out
 * exactly as the piece fades in.
 */
export type HeldBone = {
	shapes: readonly BoneShape[];
	contentOpacity: DerivedValue<number>;
};

export type SkeletonContextValue = {
	/** True while loading: primitives hide their content and report shapes. */
	measuring: boolean;
	/** The `<Skeleton>` root; every shape is measured relative to it. */
	rootRef: RefObject<HostInstance | null>;
	/** Changes when the root's layout changes, so primitives re-measure. */
	layoutVersion: number;
	radius: number;
	/** Report this primitive's shapes, or `null` to remove them. */
	setShapes: (id: string, shapes: readonly BoneShape[] | null) => void;
	/** Milliseconds into the current reveal; every piece fades from it. */
	revealClock: SharedValue<number>;
	/** Delays, fade and timing of the current reveal. */
	revealPlan: RevealPlan;
	/** Keep this piece's bar after loading, or `null` to drop it. */
	setHeld: (id: string, held: HeldBone | null) => void;
};

/**
 * Present inside every `<Skeleton>`, loading or not, so a primitive keeps the
 * same animated component through loading, reveal and after. `null` means
 * "not in a skeleton": render a plain `Text`/`View`/`Image`.
 */
export const SkeletonContext = createContext<SkeletonContextValue | null>(null);

export function useSkeleton(): SkeletonContextValue | null {
	return useContext(SkeletonContext);
}
