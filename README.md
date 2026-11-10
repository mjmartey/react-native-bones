# react-native-bones

Skeleton loaders measured from your real React Native UI.

Render your screen once, with sample data, and `react-native-bones` draws a skeleton of exactly what is about to load: one bar per line of text, one block per image or chip, all under a single shimmer that stays in step across the screen. When the data arrives, the content replaces its skeleton with a smooth reveal.

There is no second "skeleton version" of a screen to draw by hand, and no box sizes to keep in sync with your layout.

- **Measured, not guessed.** Text bars come from React Native's own line layout, so line breaks, fonts and `lineHeight` are always right.
- **One synced shimmer.** Every skeleton on screen shares one diagonal band, timed by the frame clock, however late it mounts.
- **Smooth reveals.** Crossfade, a top-to-bottom sequence, or a diagonal sweep, and a `smart` default that picks for you.
- **Drop-in primitives.** `Bones.Text`, `Bones.View` and `Bones.Image` behave exactly like `Text`, `View` and `Image` outside a skeleton.
- **Accessible.** Busy state and a label for screen readers, and still bars with instant reveals under Reduce Motion.
- **No native code of its own.** Pure TypeScript on top of Reanimated and Skia. Works in Expo Go.

> **Status:** in development, not published yet.

## Install

```sh
npx expo install react-native-bones react-native-reanimated react-native-worklets @shopify/react-native-skia
```

Or, without Expo:

```sh
npm install react-native-bones react-native-reanimated react-native-worklets @shopify/react-native-skia
```

| Peer dependency              | Version                  |
| ---------------------------- | ------------------------ |
| `react`                      | 19+                      |
| `react-native`               | 0.79+ (New Architecture) |
| `react-native-reanimated`    | 4+                       |
| `react-native-worklets`      | 0.5+                     |
| `@shopify/react-native-skia` | 2+                       |

Expo projects need no further setup. In a bare React Native app, follow the [Reanimated](https://docs.swmansion.com/react-native-reanimated/) and [Skia](https://shopify.github.io/react-native-skia/) install guides (Reanimated needs its Babel plugin).

## Quick start

Wrap the part of the screen that loads in `<Skeleton>`, give it a `sample` shaped like your data, and use the `Bones` primitives where you would use `Text`, `View` and `Image`:

```tsx
import { Bones, Skeleton } from "react-native-bones";

const SAMPLE_USER = {
	name: "Kwame Mensah",
	role: "Field Agent · Accra",
	avatar: "",
};

function Profile() {
	const { data } = useQuery({ queryKey: ["user"], queryFn: getUser });

	return (
		<Skeleton data={data} sample={SAMPLE_USER} label="Loading profile">
			{(user) => (
				<View style={styles.row}>
					<Bones.Image source={{ uri: user.avatar }} style={styles.avatar} />
					<View>
						<Bones.Text style={styles.name}>{user.name}</Bones.Text>
						<Bones.Text style={styles.role}>{user.role}</Bones.Text>
					</View>
				</View>
			)}
		</Skeleton>
	);
}
```

While `data` is `null` or `undefined`, the children render with `sample` instead, invisibly, and are traced into bars. Your component only ever receives real data once it has arrived.

`BonesProvider` is optional; add it near the root to set a theme or reveal mode for the whole app (see [Theming](#theming)).

## The primitives

| Primitive     | Inside a loading `<Skeleton>`                                                  | Anywhere else   |
| ------------- | ------------------------------------------------------------------------------ | --------------- |
| `Bones.Text`  | One bar per laid-out line, sized to the font                                   | A plain `Text`  |
| `Bones.View`  | One block for the view and everything inside it: buttons, chips, badges        | A plain `View`  |
| `Bones.Image` | One block; after the reveal it keeps its bar until the image itself has loaded | A plain `Image` |

Outside a skeleton they render the plain component with no extra hooks, so a design system can build its base `Text` on `Bones.Text` and get skeletons on every screen for free.

A block keeps its element's own `borderRadius`, so a round avatar stays round and a pill stays a pill.

Plain `Text`, `View` and `Image` inside a `<Skeleton>` stay visible while loading. That is useful for labels and chrome that don't depend on data.

## Choosing a sample

The sample decides the skeleton's shape, so give it **typical** values, not the longest or shortest possible:

```ts
const SAMPLE_USER = {
	name: "Kwame Mensah",
	bio: "Two or three lines of typical bio text…",
};
```

- Real data will rarely be exactly the sample's length. Bars a little too long or short are fine; heights are always exact, because they come from the real font.
- If the real text wraps to a different number of lines, the skeleton's height eases to the new size instead of jumping. Use `numberOfLines` where a field must keep a fixed height.
- For lists, vary the lengths so the skeleton doesn't look like a stack of identical bars:

```ts
const SAMPLE_ROWS = [
	{ id: "1", name: "Ama Owusu-Boateng" },
	{ id: "2", name: "Kofi Asare" },
	{ id: "3", name: "Efua Nyarko" },
];
```

- **Give images a size**: a `width` and `height`, or `width: "100%"` with an `aspectRatio`. An image has no size until it downloads, so without one its bar has no room.

## Reveals

A reveal is the moment content replaces its skeleton. Set the mode on the provider:

```tsx
<BonesProvider reveal="smart">
```

| Mode              | What you see                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `smart` (default) | Picks for you: data within 150 ms shows at once with no skeleton, small content crossfades, larger content (4 rows or more) plays a sequence. |
| `together`        | The whole skeleton crossfades into the content in 200 ms.                                                                                     |
| `sequence`        | Pieces come in top to bottom; pieces on the same row come in together.                                                                        |
| `sweep`           | A soft diagonal edge, at the shimmer's angle, wipes the skeleton away and uncovers the content behind it.                                     |

The bars sit on top and keep shimmering while they fade, so the light passes over the arriving content.

Skeletons wait 150 ms before appearing and then fade in, so a cached or fast response never flashes one up and away.

## Theming

```tsx
import { BonesProvider } from "react-native-bones";

<BonesProvider
	mode="system"
	reveal="smart"
	theme={{
		animation: "shimmer",
		radius: 4,
		light: { base: "#E4E7EC", highlight: "#FCFCFD" },
		dark: { base: "#2A2F37", highlight: "#4B5361" },
	}}
>
	<App />
</BonesProvider>;
```

Every field is optional; anything left out keeps its default.

| `BonesProvider` prop        | Default     |                                                                           |
| --------------------------- | ----------- | ------------------------------------------------------------------------- |
| `mode`                      | `"system"`  | `"light"`, `"dark"`, or follow the phone's setting                        |
| `reveal`                    | `"smart"`   | See [Reveals](#reveals)                                                   |
| `theme.animation`           | `"shimmer"` | `"shimmer"`, `"pulse"` (all bars breathe together) or `"none"`            |
| `theme.radius`              | `4`         | Corner radius of text bars and of blocks without their own `borderRadius` |
| `theme.light`, `theme.dark` | see above   | `base` is the bar colour, `highlight` the shimmer's bright band           |

`useBonesTheme()` returns the resolved theme, for drawing your own matching placeholders.

## `<Skeleton>` props

| Prop       | Type                      |                                                                              |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `data`     | `T \| null \| undefined`  | Real data. The skeleton shows while it is `null` or `undefined`.             |
| `sample`   | `T`                       | Stand-in data used to draw the skeleton.                                     |
| `children` | `(value: T) => ReactNode` | Renders the content, from `sample` while loading and `data` after.           |
| `loading`  | `boolean`                 | Show the skeleton even when `data` is present, for example while refetching. |
| `label`    | `string`                  | Read to screen readers while loading. Defaults to `"Loading"`.               |
| `onReveal` | `() => void`              | Called once content has come in over a skeleton, for example to move focus.  |
| `style`    | `ViewStyle`               | Style of the skeleton's root view, which wraps the content.                  |

With TanStack Query, pass `data` straight through: it is empty until the first response, so the skeleton shows only then, and a background refetch keeps the content on screen.

## Accessibility

- While loading, the skeleton is a single element marked busy, and its `label` is read in place of the hidden sample content. The bars are never read out.
- Once loaded, the real content is read normally.
- Under **Reduce Motion** (iOS) or **Remove animations** (Android), bars hold still and every reveal is instant.

## How it works

1. **Layout by React Native.** Your content renders with the sample data at `opacity: 0`, so every size and line break is React Native's own.
2. **Lines from `onTextLayout`.** Each `Bones.Text` reads its laid-out lines and turns each into a bar. Bars are sized from the font's cap height: it is the one line metric a custom `lineHeight` does not inflate, so bars are the height of the letters, not of the line box.
3. **Positions from `measureLayout`.** Each primitive measures itself relative to its `<Skeleton>` and reports its shapes through context.
4. **Drawn with Skia.** All bars are drawn on one canvas on top of the content, filled by one repeating diagonal gradient positioned in screen coordinates, so the shimmer runs continuously across separate skeletons.
5. **Animated on the UI thread.** The shimmer, the reveal and the sweep's mask are Reanimated worklets driven by the frame clock, so they stay smooth while JavaScript is busy handling your data.

## Limitations

- Content is not masked during a `sweep`; each piece fades in as the edge crosses it, so text much longer than its sample can show slightly ahead of the edge. A pixel-exact masked sweep is planned as an optional add-on.
- When a skeleton changes height on reveal, views around it that are not inside a skeleton move without animating.
- Components that don't measure well, such as charts or canvases, should be wrapped in `Bones.View` to be drawn as one block.

## Credits

Inspired by [Skullet](https://skullet.lochie.me) by Lochie Axon ([MIT](https://github.com/lochie/skullet)), and built to feel the same on React Native. `react-native-bones` is an independent implementation and is not affiliated with Skullet.

## License

MIT
