import { createContext, type RefObject, useContext } from "react";
import type { ViewInstance } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { BoneShape } from "./types";

export type SkeletonContextValue = {
	/** True while loading: primitives hide their content and report shapes. */
	measuring: boolean;
	/** The `<Skeleton>` root; every shape is measured relative to it. */
	rootRef: RefObject<ViewInstance | null>;
	/** Changes when the root's layout changes, so primitives re-measure. */
	layoutVersion: number;
	radius: number;
	/** Report this primitive's shapes, or `null` to remove them. */
	setShapes: (id: string, shapes: readonly BoneShape[] | null) => void;
	/** Milliseconds into the current reveal; every piece fades from it. */
	revealClock: SharedValue<number>;
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
