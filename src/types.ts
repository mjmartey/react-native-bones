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
	/**
	 * Read to screen readers while loading, in place of the hidden sample
	 * content. Defaults to "Loading".
	 */
	label?: string;
	/** Called once content has come in over a skeleton (e.g. to move focus). */
	onReveal?: () => void;
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
/**
 * How content replaces its skeleton.
 * - `smart` (default): no reveal for fast data, `together` for small
 *   content, `sequence` for larger content.
 * - `together`: every piece crossfades at once.
 * - `sequence`: pieces come in top to bottom.
 * - `sweep`: pieces come in left to right across the screen.
 */
export type BonesReveal = "smart" | "together" | "sequence" | "sweep";

export type BonesTheme = {
	colors: BonesColors;
	radius: number;
	animation: BonesAnimation;
	reveal: BonesReveal;
};

export type BonesProviderProps = {
	theme?: BonesThemeInput;
	/** `system` follows the phone's light/dark setting. Defaults to `system`. */
	mode?: "light" | "dark" | "system";
	/** How content replaces its skeleton. Defaults to `smart`. */
	reveal?: BonesReveal;
	children: ReactNode;
};
