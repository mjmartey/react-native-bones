import { useEffect, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import { Bones, Skeleton } from "react-native-bones";

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

// Pretends to fetch: data is null for 2 seconds, then arrives.
function useFakeFetch<T>(value: T) {
	const [data, setData] = useState<T | null>(null);
	useEffect(() => {
		const timer = setTimeout(() => setData(value), 2000);
		return () => clearTimeout(timer);
	}, [value]);
	return data;
}

export default function App() {
	const [reloadKey, setReloadKey] = useState(0);
	const [holdLoading, setHoldLoading] = useState(true);

	return (
		<ScrollView contentContainerStyle={styles.screen}>
			<Text style={styles.title}>Bones Playground</Text>

			<View style={styles.controls}>
				<View style={styles.control}>
					<Switch value={holdLoading} onValueChange={setHoldLoading} />
					<Text>Hold loading</Text>
				</View>
				<Pressable
					style={styles.button}
					onPress={() => setReloadKey((k) => k + 1)}
				>
					<Text style={styles.buttonText}>Reload</Text>
				</Pressable>
			</View>

			{/* A new key remounts Cards, so the fake fetch starts over. */}
			<Cards key={reloadKey} holdLoading={holdLoading} />
		</ScrollView>
	);
}

function Cards({ holdLoading }: Readonly<{ holdLoading: boolean }>) {
	const agent = useFakeFetch(REAL_AGENT);
	const rows = useFakeFetch(REAL_ROWS);

	return (
		<>
			<Text style={styles.section}>Profile card</Text>
			<Skeleton
				data={agent}
				sample={SAMPLE_AGENT}
				loading={holdLoading}
				style={styles.card}
			>
				{(a) => (
					<>
						<View style={styles.header}>
							<Bones.Image
								source={a.avatar ? { uri: a.avatar } : undefined}
								style={styles.avatar}
							/>
							<View style={styles.flex}>
								<Bones.Text style={styles.name} numberOfLines={1}>
									{a.name}
								</Bones.Text>
								<Bones.Text style={styles.muted}>{a.role}</Bones.Text>
							</View>
						</View>
						<Bones.Text style={styles.body}>{a.bio}</Bones.Text>
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
				style={styles.card}
			>
				{(list) =>
					list.map((row) => (
						<View key={row.id} style={styles.row}>
							<Bones.Text style={styles.body}>{row.name}</Bones.Text>
							<Bones.Text style={styles.amount}>{row.amount}</Bones.Text>
						</View>
					))
				}
			</Skeleton>
		</>
	);
}

const styles = StyleSheet.create({
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
