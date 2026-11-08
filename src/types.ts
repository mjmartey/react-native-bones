import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** One bar of the skeleton, in the coordinate space of its `<Skeleton>`. */
export type BoneShape = {
	x: number;
	y: number;
	width: number;
	height: number;
	radius: number;
};

export type SkeletonProps<T> = {
	/** Real data. While it is `null` or `undefined`, the skeleton shows. */
	data: T | null | undefined;
	/** Stand-in data used to render and measure the skeleton's shape. */
	sample: T;
	/** Show the skeleton even when `data` is present (e.g. while refetching). */
	loading?: boolean;
	children: (value: T) => ReactNode;
	style?: StyleProp<ViewStyle>;
};

export type BonesAnimation = "shimmer" | "pulse" | "none";

export type BonesColors = {
	/** The bar colour. */
	base: string;
	/** The shimmer's bright band. */
	highlight: string;
};

/** What `BonesProvider` accepts. Every field is optional. */
export type BonesThemeInput = {
	light?: Partial<BonesColors>;
	dark?: Partial<BonesColors>;
	/** Corner radius for bars whose element sets no `borderRadius`. */
	radius?: number;
	animation?: BonesAnimation;
};

/** The resolved theme a skeleton draws with. */
export type BonesTheme = {
	colors: BonesColors;
	radius: number;
	animation: BonesAnimation;
};

export type BonesProviderProps = {
	theme?: BonesThemeInput;
	/** `system` follows the phone's light/dark setting. Defaults to `system`. */
	mode?: "light" | "dark" | "system";
	children: ReactNode;
};
