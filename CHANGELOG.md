# react-native-bones

## 0.1.0

### Minor Changes

- 15b553a: First release.
  
  - `<Skeleton>` renders your content with sample data and traces it into a skeleton, then reveals the real data when it arrives.
  - `Bones.Text`, `Bones.View` and `Bones.Image`: drop-in primitives that measure themselves inside a skeleton and behave like `Text`, `View` and `Image` everywhere else.
  - One repeating diagonal shimmer, drawn with Skia and timed by the frame clock, in step across every skeleton on screen. Also `pulse` and `none`.
  - Reveals: `smart` (default), `together`, `sequence` and a diagonal `sweep`. Skeletons wait 150 ms and fade in, so fast data never flashes one.
  - Images keep their bar until they have loaded; size changes ease instead of snapping.
  - `BonesProvider` for colours, radius, animation, light/dark/system and reveal mode.
  - Accessibility: busy state and `label` for screen readers, still bars and instant reveals under Reduce Motion, and `onReveal`.
