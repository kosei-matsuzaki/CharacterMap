import { MarkerType } from "reactflow";

// --- タグモデル ---
export class Tag {
	constructor({ id, label, color }) {
		this.id = id || crypto.randomUUID();
		this.label = label || "";
		this.color = color || { bg: "#eee", text: "#333" };
	}
}

// --- 人物モデル ---
export class Person {
	constructor({ id, label, description, details, image, tags, position }) {
		this.id = id || crypto.randomUUID();
		this.label = label || "";
		this.description = description || "";
		this.details = details || "";
		this.image = image || null;
		this.tags = tags || [];
		this.position = position || { x: 0, y: 0 };
	}

	toNode() {
		return {
			id: this.id,
			type: "person",
			position: this.position,
			// ★追加: fitViewが初期ロード時に計算しやすいよう、幅と高さを明示しておく
			width: 85,
			height: 100,
			data: {
				label: this.label,
				description: this.description,
				details: this.details,
				image: this.image,
				tags: this.tags,
			},
		};
	}

	static fromNode(node) {
		return new Person({
			id: node.id,
			position: node.position,
			...node.data,
		});
	}
}

// --- 関係線モデル ---
export class Relationship {
	constructor({ id, sourceId, targetId, label, tags }) {
		this.id = id || `e${sourceId}-${targetId}-${Date.now()}`;
		this.sourceId = sourceId;
		this.targetId = targetId;
		this.label = label || "";
		this.tags = tags || [];
	}

	toEdge() {
		return {
			id: this.id,
			source: this.sourceId,
			target: this.targetId,
			type: "floating",
			markerEnd: {
				type: MarkerType.ArrowClosed,
				color: "currentColor",
				width: 20,
				height: 20,
			},
			style: { strokeWidth: 4 },
			// ★修正: ここに label プロパティを追加しないと文字が表示されません
			label: this.label,
			data: {
				text: this.label,
				tags: this.tags,
			},
		};
	}

	static fromEdge(edge) {
		return new Relationship({
			id: edge.id,
			sourceId: edge.source,
			targetId: edge.target,
			label: edge.data?.text || "",
			tags: edge.data?.tags || [],
		});
	}
}

// --- 相関図全体モデル ---
export class Diagram {
	constructor({ id, name, people, relationships, tags, updatedAt }) {
		this.id = id;
		this.name = name || "新規相関図";
		this.people = people || [];
		this.relationships = relationships || [];
		this.tags = tags || [];
		this.updatedAt = updatedAt || new Date().toISOString();
	}
}
