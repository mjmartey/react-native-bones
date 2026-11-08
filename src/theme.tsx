import { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { DEFAULT_COLORS, DEFAULT_RADIUS } from "./constants";
import type { BonesProviderProps, BonesTheme } from "./types";

const DEFAULT_THEME: BonesTheme = {
	colors: DEFAULT_COLORS.light,
	radius: DEFAULT_RADIUS,
	animation: "shimmer",
	reveal: "together",
};

/**
 * Holds the resolved theme. Its default is a working light theme, so a
 * `<Skeleton>` works without any provider; `BonesProvider` is optional.
 */
const ThemeContext = createContext<BonesTheme | null>(null);

/** Sets colours, radius, animation, light/dark and reveal for every skeleton inside. */
export function BonesProvider({
	theme,
	mode = "system",
	reveal = "together",
	children,
}: BonesProviderProps) {
	const systemScheme = useColorScheme();
	const scheme =
		mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

	const value = useMemo<BonesTheme>(
		() => ({
			colors: { ...DEFAULT_COLORS[scheme], ...theme?.[scheme] },
			radius: theme?.radius ?? DEFAULT_RADIUS,
			animation: theme?.animation ?? "shimmer",
			reveal,
		}),
		[scheme, theme, reveal],
	);

	return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useBonesTheme(): BonesTheme {
	return useContext(ThemeContext) ?? DEFAULT_THEME;
}
