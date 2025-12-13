import PersonNode from "./components/diagram/PersonNode";
import SimpleFloatingEdge from "./components/diagram/SimpleFloatingEdge";

export const NODE_TYPES = { person: PersonNode };
export const EDGE_TYPES = { floating: SimpleFloatingEdge };

export const DEFAULT_EDGE_OPTIONS = {
	type: "floating",
	style: { strokeWidth: 4, stroke: "#b1b1b7" },
};
export const TAG_COLORS = [
	{ bg: "#ffe2dd", text: "#5d1715" },
	{ bg: "#fdecc8", text: "#5c3b0d" },
	{ bg: "#dbeddb", text: "#1c3829" },
	{ bg: "#d3e5ef", text: "#183347" },
	{ bg: "#f3e0f5", text: "#412454" },
	{ bg: "#e5e5e0", text: "#32302c" },
];

export const STYLES = {
	input: {
		padding: "8px",
		borderRadius: "4px",
		border: "1px solid #ccc",
		width: "100%",
		boxSizing: "border-box",
		fontSize: "14px",
	},
	label: {
		fontSize: "12px",
		fontWeight: "bold",
		display: "block",
		marginBottom: "4px",
		color: "#555",
	},
	flexCenter: { display: "flex", alignItems: "center", gap: "10px" },

	modalOverlay: {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: "rgba(0,0,0,0.5)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 100,
	},
	modalContent: {
		background: "white",
		padding: "24px",
		borderRadius: "8px",
		width: "340px",
		display: "flex",
		flexDirection: "column",
		gap: "12px",
		boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
	},
};
