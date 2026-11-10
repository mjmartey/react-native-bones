# react-native-bones · Spec

Skeleton loaders measured from your real UI, for React Native. Inspired by [Skullet](https://skullet.lochie.me) (web, MIT).

## Approach: measuring primitives (A)

React Native has no DOM, so a component can't look inside another component to find its text. Instead, `react-native-bones` ships drop-in primitives (`Bones.Text`, `Bones.View`, `Bones.Image`). Inside a `<Skeleton>` they measure themselves and report their shapes; outside one they behave exactly like `Text`, `View` and `Image`. A design system that builds its base text on `Bones.Text` gets skeletons on every screen.

No native code: pure TypeScript, works in Expo Go.

| Skullet (web)                               | react-native-bones                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| Render sample data with transparent text    | Same                                                                                   |
| `Range.getClientRects()` (one box per line) | `<Text onTextLayout>` (lines with x, y, width, height, ascender, descender, capHeight) |
| `getBoundingClientRect`, `ResizeObserver`   | `onLayout`, `ref.measureLayout(skeletonRoot)`                                          |
| Shadow-DOM overlay                          | One Skia `Canvas` drawing every bar                                                    |
| One shimmer phase per page                  | One shared Reanimated clock; each bar's offset comes from its x position               |
| `prefers-reduced-motion`                    | Reanimated `useReducedMotion` / `AccessibilityInfo`                                    |

Peer dependencies: `react`, `react-native`, `react-native-reanimated` (4+), `@shopify/react-native-skia` (2+).

## Version 1

```tsx
import { BonesProvider, Skeleton, Bones } from "react-native-bones";

<BonesProvider theme={{ animation: "shimmer", radius: 6 }} mode="system">
	<Skeleton data={user} sample={SAMPLE_USER} label="Loading profile">
		{(user) => <ProfileCard user={user} />}
	</Skeleton>
</BonesProvider>

// inside ProfileCard
<Bones.Text style={styles.name}>{user.name}</Bones.Text>
<Bones.Image source={{ uri: user.avatar }} style={{ width: 48, height: 48 }} />
```

- `<Skeleton>`: `data`, `sample`, `loading`, `label`, `onReveal`, render-function children.
- `Bones.Text` (one bar per line, trimmed to the glyphs), `Bones.View` (painted boxes), `Bones.Image` (whole block).
- `<BonesProvider>`: theme (base and highlight colours, radius, `shimmer` / `pulse` / `none`, speed), `light` / `dark` / `system`.
- Synced shimmer; crossfade reveal; data that arrives within 150 ms skips the skeleton.
- Reduced motion: still bars, instant reveal. Accessibility: busy state, `label` announced, bars hidden from screen readers.

## Version 2 (draft)

- `id` with remembered shapes (sample becomes optional), `forgetShapes()`.
- `empty`, `emptyMessage`, `error` on `<Skeleton>`.
- `Bones.Block` (group drawn as one bar) and `Bones.Ignore` (never skeletonised).
- Reveal modes `smart` / `together` / `sequence` / `sweep` and a custom `RevealSpec`.
- `<SkeletonSuspense>` for Suspense-based fetching; `<SkeletonBox>` manual bars in the same shimmer.
- `debug` overlay.
- `react-native-bones/native`: optional native view-walking mode (approach B) behind its own subpath.
- `react-native-bones/masked`: optional pixel-exact `sweep` that masks the content itself, using `@react-native-masked-view/masked-view` (included in Expo Go; Android support is experimental). The default sweep fades each piece across the edge's crossing instead.
