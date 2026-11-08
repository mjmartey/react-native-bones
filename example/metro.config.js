// Lets the example import the library straight from ../src, so edits show
// up instantly without building. The tricky part: the library folder has its
// own node_modules with react/react-native for typechecking. If Metro used
// those too, the app would load two copies of React and crash. So we block
// them and point every shared package at the example's own copy.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const root = path.resolve(__dirname, "..");
const shared = [
	"react",
	"react-native",
	"react-native-reanimated",
	"react-native-worklets",
	"@shopify/react-native-skia",
];

const escapeRegExp = (value) => value.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");

const config = getDefaultConfig(__dirname);

config.watchFolders = [root];
config.resolver.nodeModulesPaths = [path.join(__dirname, "node_modules")];
config.resolver.blockList = shared.map(
	(name) =>
		new RegExp(`^${escapeRegExp(path.join(root, "node_modules", name))}\\/.*$`),
);
config.resolver.extraNodeModules = {
	"react-native-bones": root,
	...Object.fromEntries(
		shared.map((name) => [name, path.join(__dirname, "node_modules", name)]),
	),
};

module.exports = config;
