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
