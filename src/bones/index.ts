import BonesImage from "./image";
import BonesText from "./text";
import BonesView from "./view";

/** Measuring primitives: use them where you'd use `Text`, `View` and `Image`. */
export const Bones = {
	Text: BonesText,
	View: BonesView,
	Image: BonesImage,
} as const;
