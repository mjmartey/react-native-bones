import { useEffect, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import {
	Bones,
	type BonesAnimation,
	BonesProvider,
	type BonesReveal,
	Skeleton,
} from "react-native-bones";

type Agent = { name: string; role: string; avatar: string; bio: string };
type Row = { id: string; name: string; amount: string };

// Typical-length stand-ins. Users never see these, only bars shaped like them.
const SAMPLE_AGENT: Agent = {
	name: "Kwame Mensah",
	role: "Field Agent · Accra",
	avatar: "",
	bio: "Has worked with the team for a few years. Helps customers pick a device and a payment plan, then sets up their first payment.",
};

// Varied lengths so the list skeleton doesn't look robotic.
const SAMPLE_ROWS: Row[] = [
	{ id: "1", name: "Ama Owusu-Boateng", amount: "GH₵ 240.00" },
	{ id: "2", name: "Kofi Asare", amount: "GH₵ 1,080.00" },
	{ id: "3", name: "Efua Nyarko", amount: "GH₵ 95.50" },
];

const REAL_AGENT: Agent = {
	name: "Jamel Marmarh Martey",
	role: "Senior Field Agent · Kumasi",
	avatar: "https://i.pravatar.cc/160?img=12",
	bio: "Five years on the team. Runs onboarding for new agents in the Ashanti region and handles walk-in customers on weekends.",
};

const REAL_ROWS: Row[] = [
	{ id: "1", name: "Elliot Lassey", amount: "GH₵ 320.00" },
	{ id: "2", name: "Abena Serwaa Darko", amount: "GH₵ 75.00" },
	{ id: "3", name: "Yaw Boadu", amount: "GH₵ 2,400.00" },
];

// Pretends to fetch: data is null for `delay` ms, then arrives.
function useFakeFetch<T>(value: T, delay: number) {
	const [data, setData] = useState<T | null>(null);
	useEffect(() => {
		const timer = setTimeout(() => setData(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return data;
}

// Fake network speeds: a cache hit, a fast network, a slow one.
const DELAYS = [100, 500, 2000];

const REVEALS: BonesReveal[] = ["together", "sequence", "sweep"];

const ANIMATIONS: BonesAnimation[] = ["shimmer", "pulse", "none"];

export default function App() {
	const [reloadKey, setReloadKey] = useState(0);
	const [holdLoading, setHoldLoading] = useState(false);
	const [delay, setDelay] = useState(2000);
	const [animation, setAnimation] = useState<BonesAnimation>("shimmer");
	const [dark, setDark] = useState(false);
	const [reveal, setReveal] = useState<BonesReveal>("together");
	const c = dark ? DARK : LIGHT;

	return (
		<BonesProvider
			theme={{ animation }}
			mode={dark ? "dark" : "light"}
			reveal={reveal}
		>
			<ScrollView
				contentContainerStyle={[styles.screen, { backgroundColor: c.screen }]}
			>
				<Text style={[styles.title, { color: c.text }]}>Bones Playground</Text>

				<View style={styles.controls}>
					<View style={styles.control}>
						<Switch value={holdLoading} onValueChange={setHoldLoading} />
						<Text style={{ color: c.text }}>Hold loading</Text>
					</View>
					<View style={styles.control}>
						<Switch value={dark} onValueChange={setDark} />
						<Text style={{ color: c.text }}>Dark</Text>
					</View>
					<Pressable
						style={styles.button}
						onPress={() => setReloadKey((k) => k + 1)}
					>
						<Text style={styles.buttonText}>Reload</Text>
					</Pressable>
				</View>

				<View style={styles.segments}>
					{DELAYS.map((ms) => (
						<Pressable
							key={ms}
							onPress={() => {
								setDelay(ms);
								setReloadKey((k) => k + 1);
							}}
							style={[
								styles.segment,
								{ borderColor: c.border },
								delay === ms && styles.segmentActive,
							]}
						>
							<Text
								style={[
									styles.segmentText,
									{ color: delay === ms ? "white" : c.text },
								]}
							>
								{ms < 1000 ? `${ms} ms` : `${ms / 1000} s`}
							</Text>
						</Pressable>
					))}
				</View>
				<Text style={[styles.caption, { color: c.body }]}>
					Bars show after 150 ms. Faster data appears without a skeleton.
				</Text>

				<View style={styles.segments}>
					{ANIMATIONS.map((name) => (
						<Pressable
							key={name}
							onPress={() => setAnimation(name)}
							style={[
								styles.segment,
								{ borderColor: c.border },
								animation === name && styles.segmentActive,
							]}
						>
							<Text
								style={[
									styles.segmentText,
									{ color: animation === name ? "white" : c.text },
								]}
							>
								{name}
							</Text>
						</Pressable>
					))}
				</View>

				<View style={styles.segments}>
					{REVEALS.map((name) => (
						<Pressable
							key={name}
							onPress={() => setReveal(name)}
							style={[
								styles.segment,
								{ borderColor: c.border },
								reveal === name && styles.segmentActive,
							]}
						>
							<Text
								style={[
									styles.segmentText,
									{ color: reveal === name ? "white" : c.text },
								]}
							>
								{name}
							</Text>
						</Pressable>
					))}
				</View>

				{/* A new key remounts Cards, so the fake fetch starts over. */}
				<Cards
					key={reloadKey}
					holdLoading={holdLoading}
					delay={delay}
					colors={c}
				/>
			</ScrollView>
		</BonesProvider>
	);
}

function Cards({
	holdLoading,
	delay,
	colors: c,
}: Readonly<{ holdLoading: boolean; delay: number; colors: Palette }>) {
	const agent = useFakeFetch(REAL_AGENT, delay);
	const rows = useFakeFetch(REAL_ROWS, delay);

	return (
		<>
			<Text style={styles.section}>Profile card</Text>
			<Skeleton
				data={agent}
				sample={SAMPLE_AGENT}
				loading={holdLoading}
				style={[styles.card, { backgroundColor: c.card }]}
			>
				{(a) => (
					<>
						<View style={styles.header}>
							<Bones.Image
								source={a.avatar ? { uri: a.avatar } : undefined}
								style={styles.avatar}
							/>
							<View style={styles.flex}>
								<Bones.Text
									style={[styles.name, { color: c.text }]}
									numberOfLines={1}
								>
									{a.name}
								</Bones.Text>
								<Bones.Text style={styles.muted}>{a.role}</Bones.Text>
							</View>
						</View>
						<Bones.Text style={[styles.body, { color: c.body }]}>
							{a.bio}
						</Bones.Text>
						<Bones.View style={styles.chip}>
							<Text style={styles.chipText}>Verified</Text>
						</Bones.View>
					</>
				)}
			</Skeleton>

			<Text style={styles.section}>List</Text>
			<Skeleton
				data={rows}
				sample={SAMPLE_ROWS}
				loading={holdLoading}
				style={[styles.card, { backgroundColor: c.card }]}
			>
				{(list) =>
					list.map((row) => (
						<View key={row.id} style={styles.row}>
							<Bones.Text style={[styles.body, { color: c.body }]}>
								{row.name}
							</Bones.Text>
							<Bones.Text style={[styles.amount, { color: c.text }]}>
								{row.amount}
							</Bones.Text>
						</View>
					))
				}
			</Skeleton>
		</>
	);
}

type Palette = {
	screen: string;
	card: string;
	text: string;
	body: string;
	border: string;
};

const LIGHT: Palette = {
	screen: "#F8F9FB",
	card: "#FFFFFF",
	text: "#101828",
	body: "#344054",
	border: "#D0D5DD",
};

const DARK: Palette = {
	screen: "#0C111D",
	card: "#161B26",
	text: "#F5F5F6",
	body: "#CECFD2",
	border: "#333741",
};

const styles = StyleSheet.create({
	segments: { flexDirection: "row", gap: 8 },
	segment: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
	},
	segmentActive: { backgroundColor: "#2E90FA", borderColor: "#2E90FA" },
	segmentText: { fontWeight: "600" },
	caption: { fontSize: 13, marginTop: -4 },
	screen: {
		padding: 20,
		paddingTop: 72,
		gap: 12,
		backgroundColor: "#F8F9FB",
		flexGrow: 1,
	},
	title: { fontSize: 24, fontWeight: "700" },
	controls: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	control: { flexDirection: "row", alignItems: "center", gap: 8 },
	button: {
		backgroundColor: "#101828",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	buttonText: { color: "white", fontWeight: "600" },
	section: {
		marginTop: 12,
		fontSize: 13,
		fontWeight: "600",
		color: "#667085",
		textTransform: "uppercase",
	},
	card: { backgroundColor: "white", borderRadius: 16, padding: 16, gap: 12 },
	header: { flexDirection: "row", alignItems: "center", gap: 12 },
	flex: { flex: 1, gap: 4 },
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#EAECF0",
	},
	name: { fontSize: 18, fontWeight: "600" },
	muted: { fontSize: 14, color: "#667085" },
	body: { fontSize: 15, lineHeight: 22, color: "#344054" },
	chip: {
		alignSelf: "flex-start",
		backgroundColor: "#ECFDF3",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	chipText: { color: "#027A48", fontSize: 12, fontWeight: "600" },
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	amount: { fontSize: 15, fontWeight: "600" },
});
