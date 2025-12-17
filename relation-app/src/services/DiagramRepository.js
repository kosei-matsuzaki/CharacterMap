import { Diagram, Person, Relationship, Tag } from "../models";

const STORAGE_KEY = "my-diagrams";

export class DiagramRepository {
	static getAll() {
		try {
			const json = localStorage.getItem(STORAGE_KEY);
			return json ? JSON.parse(json) : {};
		} catch (e) {
			console.error("Failed to load diagrams", e);
			return {};
		}
	}

	static getById(id) {
		const all = this.getAll();
		const data = all[id];

		if (!data) return null;

		const people = (data.nodes || []).map((n) => Person.fromNode(n));
		const relationships = (data.edges || []).map((e) =>
			Relationship.fromEdge(e)
		);
		const tags = (data.tags || []).map((t) => new Tag(t));

		return new Diagram({
			id: data.id,
			name: data.name,
			people,
			relationships,
			tags,
			updatedAt: data.updatedAt,
		});
	}

	static save(diagram) {
		const all = this.getAll();

		const saveData = {
			id: diagram.id,
			name: diagram.name,
			nodes: diagram.people.map((p) => p.toNode()),
			edges: diagram.relationships.map((r) => r.toEdge()),
			tags: diagram.tags,
			updatedAt: new Date().toLocaleString(),
		};

		all[diagram.id] = saveData;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
	}

	// ★追加: 削除メソッド
	static delete(id) {
		const all = this.getAll();
		if (all[id]) {
			delete all[id];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
		}
	}
}
