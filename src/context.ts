import { createContext, type RefObject, useContext } from "react";
import type { ViewInstance } from "react-native";
import type { BoneShape } from "./types";

export type SkeletonContextValue = {
	/** The `<Skeleton>` root; every shape is measured relative to it. */
	rootRef: RefObject<ViewInstance | null>;
	/** Changes when the root's layout changes, so primitives re-measure. */
	layoutVersion: number;
	radius: number;
	/** Report this primitive's shapes, or `null` to remove them. */
	setShapes: (id: string, shapes: readonly BoneShape[] | null) => void;
};

/** Present only while a `<Skeleton>` is loading; `null` means "render normally". */
export const SkeletonContext = createContext<SkeletonContextValue | null>(null);

export function useSkeleton(): SkeletonContextValue | null {
	return useContext(SkeletonContext);
}
