import { useCallback, useMemo, useRef, useState } from "react";
import { View, type ViewInstance } from "react-native";
import BonesOverlay from "./components/bones-overlay";
import { DEFAULT_RADIUS } from "./constants";
import { SkeletonContext, type SkeletonContextValue } from "./context";
import type { BoneShape, SkeletonProps } from "./types";
import { sameShapes } from "./utils/shapes";

type ShapeMap = Readonly<Record<string, readonly BoneShape[]>>;

export default function Skeleton<T>({
	data,
	sample,
	loading = false,
	children,
	style,
}: SkeletonProps<T>) {
	const isLoading = loading || data == null;
	const rootRef = useRef<ViewInstance>(null);
	const [layoutVersion, setLayoutVersion] = useState(0);
	const [shapes, setShapeMap] = useState<ShapeMap>({});

	const setShapes = useCallback(
		(id: string, next: readonly BoneShape[] | null) => {
			setShapeMap((current) => {
				if (next === null) {
					if (!(id in current)) return current;
					return Object.fromEntries(
						Object.entries(current).filter(([key]) => key !== id),
					);
				}
				if (sameShapes(current[id], next)) return current;
				return { ...current, [id]: next };
			});
		},
		[],
	);

	const context = useMemo<SkeletonContextValue | null>(
		() =>
			isLoading
				? { rootRef, layoutVersion, radius: DEFAULT_RADIUS, setShapes }
				: null,
		[isLoading, layoutVersion, setShapes],
	);

	const content = !isLoading && data != null ? data : sample;

	return (
		<View
			ref={rootRef}
			collapsable={false}
			style={style}
			onLayout={() => setLayoutVersion((version) => version + 1)}
		>
			<SkeletonContext value={context}>{children(content)}</SkeletonContext>
			{isLoading ? (
				<BonesOverlay shapes={Object.values(shapes).flat()} />
			) : null}
		</View>
	);
}
