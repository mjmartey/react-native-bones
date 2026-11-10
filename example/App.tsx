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

type Photo = { image: string; title: string; caption: string };

const SAMPLE_PHOTO: Photo = {
	image: "",
	title: "Branch open day",
	caption: "New agents meeting customers at the front desk.",
};

const REAL_PHOTO: Photo = {
	image: "https://picsum.photos/seed/bones/1200/675",
	title: "Kumasi branch open day",
	caption: "Walk-in customers trying devices before picking a payment plan.",
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

// Fake network speeds: a cache hit (beats the 150 ms wait, so no skeleton),
// a fast network and a slow one.
const NETWORK = [
	{ value: 100, label: "cached" },
	{ value: 500, label: "fast" },
	{ value: 2000, label: "slow" },
];

const REVEALS: BonesReveal[] = ["smart", "together", "sequence", "sweep"];

const ANIMATIONS: BonesAnimation[] = ["shimmer", "pulse", "none"];

const toOptions = <T extends string>(values: readonly T[]) =>
	values.map((value) => ({ value, label: value }));

export default function App() {
	const [reloadKey, setReloadKey] = useState(0);
	const [holdLoading, setHoldLoading] = useState(false);
	const [delay, setDelay] = useState(2000);
	const [animation, setAnimation] = useState<BonesAnimation>("shimmer");
	const [dark, setDark] = useState(false);
	const [reveal, setReveal] = useState<BonesReveal>("smart");
	const c = dark ? DARK : LIGHT;
	const reload = () => setReloadKey((k) => k + 1);

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

				<View style={[styles.settings, { backgroundColor: c.card }]}>
					<Segmented
						label="Reveal"
						options={toOptions(REVEALS)}
						value={reveal}
						onChange={setReveal}
						colors={c}
					/>
					<Segmented
						label="Shimmer"
						options={toOptions(ANIMATIONS)}
						value={animation}
						onChange={setAnimation}
						colors={c}
					/>
					<Segmented
						label="Network"
						options={NETWORK}
						value={delay}
						onChange={(ms) => {
							setDelay(ms);
							reload();
						}}
						colors={c}
					/>

					<View style={[styles.footer, { borderTopColor: c.border }]}>
						<Toggle label="Dark" value={dark} onChange={setDark} colors={c} />
						<Toggle
							label="Hold"
							value={holdLoading}
							onChange={setHoldLoading}
							colors={c}
						/>
						<Pressable style={styles.button} onPress={reload}>
							<Text style={styles.buttonText}>Reload</Text>
						</Pressable>
					</View>
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

/** One labelled row of choices, e.g. "Reveal  smart · together · …". */
function Segmented<T extends string | number>({
	label,
	options,
	value,
	onChange,
	colors: c,
}: Readonly<{
	label: string;
	options: readonly { value: T; label: string }[];
	value: T;
	onChange: (value: T) => void;
	colors: Palette;
}>) {
	return (
		<View style={styles.settingRow}>
			<Text style={[styles.rowLabel, { color: c.muted }]}>{label}</Text>
			<View style={[styles.track, { backgroundColor: c.track }]}>
				{options.map((option) => {
					const active = option.value === value;
					return (
						<Pressable
							key={option.label}
							onPress={() => onChange(option.value)}
							style={[styles.segment, active && styles.segmentActive]}
						>
							<Text
								numberOfLines={1}
								style={[
									styles.segmentText,
									{ color: active ? "white" : c.text },
								]}
							>
								{option.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

function Toggle({
	label,
	value,
	onChange,
	colors: c,
}: Readonly<{
	label: string;
	value: boolean;
	onChange: (value: boolean) => void;
	colors: Palette;
}>) {
	return (
		<View style={styles.toggle}>
			<Switch value={value} onValueChange={onChange} style={styles.switch} />
			<Text style={[styles.toggleText, { color: c.text }]}>{label}</Text>
		</View>
	);
}

function Cards({
	holdLoading,
	delay,
	colors: c,
}: Readonly<{ holdLoading: boolean; delay: number; colors: Palette }>) {
	const agent = useFakeFetch(REAL_AGENT, delay);
	// A new URL per reload, so the phone can't serve the avatar from cache and
	// you can watch it hold its bar while it downloads.
	const [cacheBuster] = useState(() => Date.now());
	const rows = useFakeFetch(REAL_ROWS, delay);
	const photo = useFakeFetch(REAL_PHOTO, delay);

	return (
		<>
			<Text style={styles.section}>Profile card</Text>
			<Skeleton
				data={agent}
				sample={SAMPLE_AGENT}
				label="Loading profile"
				loading={holdLoading}
				style={[styles.card, { backgroundColor: c.card }]}
			>
				{(a) => (
					<>
						<View style={styles.header}>
							<Bones.Image
								source={
									a.avatar ? { uri: `${a.avatar}&v=${cacheBuster}` } : undefined
								}
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

			<Text style={styles.section}>Branch</Text>
			<Skeleton
				data={photo}
				sample={SAMPLE_PHOTO}
				label="Loading photo"
				loading={holdLoading}
				style={[styles.card, { backgroundColor: c.card }]}
			>
				{(p) => (
					<>
						{/* Full width with a fixed ratio, so it has a shape before loading. */}
						<Bones.Image
							source={
								p.image ? { uri: `${p.image}?v=${cacheBuster}` } : undefined
							}
							style={styles.photo}
						/>
						<Bones.Text style={[styles.name, { color: c.text }]}>
							{p.title}
						</Bones.Text>
						<Bones.Text style={[styles.body, { color: c.body }]}>
							{p.caption}
						</Bones.Text>
					</>
				)}
			</Skeleton>

			<Text style={styles.section}>List</Text>
			<Skeleton
				data={rows}
				sample={SAMPLE_ROWS}
				label="Loading payments"
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
	muted: string;
	track: string;
};

const LIGHT: Palette = {
	screen: "#F8F9FB",
	card: "#FFFFFF",
	text: "#101828",
	body: "#344054",
	border: "#EAECF0",
	muted: "#667085",
	track: "#F2F4F7",
};

const DARK: Palette = {
	screen: "#0C111D",
	card: "#161B26",
	text: "#F5F5F6",
	body: "#CECFD2",
	border: "#333741",
	muted: "#94969C",
	track: "#1F242F",
};

const styles = StyleSheet.create({
	settings: { borderRadius: 16, padding: 12, gap: 10 },
	settingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
	rowLabel: {
		width: 62,
		fontSize: 11,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.4,
	},
	track: { flex: 1, flexDirection: "row", borderRadius: 8, padding: 2 },
	segment: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 6,
		borderRadius: 6,
	},
	segmentActive: { backgroundColor: "#2E90FA" },
	segmentText: { fontSize: 12, fontWeight: "600" },
	footer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		paddingTop: 10,
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	toggle: { flexDirection: "row", alignItems: "center", gap: 6 },
	switch: { transform: [{ scale: 0.8 }] },
	toggleText: { fontSize: 13, fontWeight: "500" },
	screen: {
		padding: 20,
		paddingTop: 72,
		gap: 12,
		backgroundColor: "#F8F9FB",
		flexGrow: 1,
	},
	title: { fontSize: 24, fontWeight: "700" },
	button: {
		marginLeft: "auto",
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
	photo: {
		width: "100%",
		aspectRatio: 16 / 9,
		borderRadius: 12,
		backgroundColor: "#EAECF0",
	},
	amount: { fontSize: 15, fontWeight: "600" },
});
