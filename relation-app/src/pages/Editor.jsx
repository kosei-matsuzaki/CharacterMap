import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
	addEdge,
	Background,
	Controls,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { DEFAULT_EDGE_OPTIONS, EDGE_TYPES, NODE_TYPES } from "../constants";
import { useDiagramFilter } from "../hooks/useDiagramFilter";
import { getLayoutedElements } from "../utils/utils";

import { useDialog } from "../contexts/DialogContext";
import { useLoading } from "../contexts/LoadingContext";
import { Diagram, Person, Relationship, Tag } from "../models";
import { DiagramRepository } from "../services/DiagramRepository";

// EdgeModalのimport削除
import TagManagerModal from "../components/modals/TagManagerModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import SidePanel from "../components/ui/SidePanel";

export default function Editor() {
	const { id } = useParams();
	const navigate = useNavigate();

	// --- 初期データ読み込み ---
	const initialDiagram = useMemo(() => {
		const diagram = DiagramRepository.getById(id);
		if (diagram) return diagram;
		return new Diagram({ id, name: "新規相関図" });
	}, [id]);

	const nodeTypes = useMemo(() => NODE_TYPES, []);
	const edgeTypes = useMemo(() => EDGE_TYPES, []);

	const [nodes, setNodes, onNodesChange] = useNodesState(
		initialDiagram.people.map((p) => p.toNode())
	);
	const [edges, setEdges, onEdgesChange] = useEdgesState(
		initialDiagram.relationships.map((r) => r.toEdge())
	);

	const [tags, setTags] = useState(initialDiagram.tags);
	const [diagramName, setDiagramName] = useState(initialDiagram.name);
	const [activeTagId, setActiveTagId] = useState(null);

	// UI状態
	const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

	// ★修正: 汎用的な選択ステート { type: 'node'|'edge', data: Object }
	const [selection, setSelection] = useState(null);

	const { showAlert } = useDialog();
	const { showLoading, hideLoading } = useLoading();
	const { fitView } = useReactFlow();

	useEffect(() => {
		showLoading("読み込み中...");
		const timer = setTimeout(() => {
			fitView({ padding: 0.2 });
			hideLoading();
		}, 300);
		return () => clearTimeout(timer);
	}, [fitView, showLoading, hideLoading]);

	useDiagramFilter(nodes, edges, setNodes, setEdges, activeTagId, tags);

	// --- ハンドラー ---

	// 人物追加パネルを開く
	const handleAddPerson = () => {
		setSelection({
			type: "node",
			data: {
				id: `new-${Date.now()}`,
				data: { label: "", description: "", details: "", tags: [] },
			},
		});
	};

	// 関係追加パネルを開く
	const handleAddEdge = () => {
		setSelection({
			type: "edge",
			data: {
				id: `new-edge-${Date.now()}`,
				source: "", // 新規時は空
				target: "",
				data: { text: "", tags: [] },
			},
		});
	};

	const onNodeClick = (e, node) => {
		setSelection({ type: "node", data: node });
	};

	const onEdgeClick = (e, edge) => {
		setSelection({ type: "edge", data: edge });
	};

	const onPaneClick = () => {
		setSelection(null);
	};

	// ★修正: SidePanelからの保存 (Node/Edge共通)
	const handleSaveFromPanel = (itemId, newData, type) => {
		if (type === "node") {
			// --- ノード保存 ---
			if (itemId.startsWith("new-")) {
				const newPerson = new Person({
					...newData,
					position: { x: 0, y: 0 },
				});
				setNodes((nds) => nds.concat(newPerson.toNode()));
				setSelection(null);
			} else {
				setNodes((nds) =>
					nds.map((n) =>
						n.id === itemId ? { ...n, data: { ...n.data, ...newData } } : n
					)
				);
				// パネルの表示も更新
				setSelection((prev) => ({
					...prev,
					data: { ...prev.data, data: { ...prev.data.data, ...newData } },
				}));
			}
		} else if (type === "edge") {
			// --- エッジ保存 ---
			const { source, target, text, tags } = newData;

			if (itemId.startsWith("new-")) {
				// 新規作成
				const newRelationship = new Relationship({
					sourceId: source,
					targetId: target,
					label: text,
					tags: tags,
				});
				setEdges((eds) => addEdge(newRelationship.toEdge(), eds));
				setSelection(null);
			} else {
				// 更新
				setEdges((eds) =>
					eds.map((e) => {
						if (e.id === itemId) {
							// モデル経由でデータを整形
							const rel = new Relationship({
								id: e.id,
								sourceId: source,
								targetId: target,
								label: text,
								tags: tags,
							});
							const newEdge = rel.toEdge();
							return {
								...newEdge,
								style: { ...e.style, ...newEdge.style }, // 既存スタイル維持
							};
						}
						return e;
					})
				);
				// パネル表示更新 (簡易的に閉じるか、データ更新)
				// エッジの更新は複雑なので一旦パネルを閉じます
				setSelection(null);
			}
		}
	};

	// ★修正: SidePanelからの削除 (Node/Edge共通)
	const handleDeleteFromPanel = (itemId, type) => {
		if (type === "node") {
			setNodes((nds) => nds.filter((n) => n.id !== itemId));
			setEdges((eds) =>
				eds.filter((e) => e.source !== itemId && e.target !== itemId)
			);
		} else if (type === "edge") {
			setEdges((eds) => eds.filter((e) => e.id !== itemId));
		}
		setSelection(null);
	};

	const handleAddTag = (newTagData) => {
		const newTag = new Tag(newTagData);
		setTags([...tags, newTag]);
	};

	const handleDeleteTag = (tagId) => {
		setTags((prev) => prev.filter((t) => t.id !== tagId));
		setEdges((prev) =>
			prev.map((e) => ({
				...e,
				data: {
					...e.data,
					tags: (e.data?.tags || []).filter((id) => id !== tagId),
				},
			}))
		);
		setNodes((prev) =>
			prev.map((n) => ({
				...n,
				data: {
					...n.data,
					tags: (n.data?.tags || []).filter((id) => id !== tagId),
				},
			}))
		);
		if (activeTagId === tagId) setActiveTagId(null);
	};

	const handleSaveDiagram = () => {
		const people = nodes.map((n) => Person.fromNode(n));
		const relationships = edges.map((e) => Relationship.fromEdge(e));

		const diagram = new Diagram({
			id,
			name: diagramName,
			people,
			relationships,
			tags,
		});

		try {
			DiagramRepository.save(diagram);
			navigate(`/viewer/${id}`);
		} catch (e) {
			console.error(e);
			showAlert("保存に失敗しました", "エラー");
		}
	};

	const onLayout = useCallback(() => {
		const layouted = getLayoutedElements(nodes, edges);
		setNodes([...layouted.nodes]);
		setEdges([...layouted.edges]);
		window.requestAnimationFrame(() => fitView());
	}, [nodes, edges, setNodes, setEdges, fitView]);

	return (
		<div className="full-screen">
			<div className="toolbar">
				<div className="toolbar-row">
					<Button variant="secondary" onClick={() => navigate(`/viewer/${id}`)}>
						← 戻る
					</Button>
					<div className="title-input-container">
						<Input
							value={diagramName}
							onChange={(e) => setDiagramName(e.target.value)}
							containerStyle={{ marginBottom: 0 }}
							placeholder="相関図タイトル"
						/>
					</div>
					<Button onClick={handleAddPerson}>+ 人物</Button>
					{/* ★修正: EdgeModalではなくPanelを開く */}
					<Button onClick={handleAddEdge}>+ 関係</Button>
					<Button
						style={{ background: "var(--accent-color)" }}
						onClick={onLayout}
					>
						整列
					</Button>
					<Button
						style={{ background: "var(--success-color)", marginLeft: "auto" }}
						onClick={handleSaveDiagram}
					>
						保存
					</Button>
				</div>

				<div className="filter-bar">
					<span className="filter-label">フィルタ:</span>
					{tags.map((tag) => {
						const isActive = activeTagId === tag.id;
						return (
							<button
								key={tag.id}
								onClick={() => setActiveTagId(isActive ? null : tag.id)}
								className="filter-btn"
								style={{
									background: isActive ? tag.color.bg : "#eee",
									color: isActive ? tag.color.text : "#aaa",
									border: isActive
										? `2px solid ${tag.color.text}`
										: "1px solid #ccc",
									fontWeight: isActive ? "bold" : "normal",
								}}
							>
								{tag.label}
							</button>
						);
					})}
					{activeTagId && (
						<button
							onClick={() => setActiveTagId(null)}
							className="filter-clear-btn"
						>
							クリア
						</button>
					)}
					<Button
						variant="icon"
						onClick={() => setIsTagManagerOpen(true)}
						title="タグ管理"
					>
						⚙️
					</Button>
				</div>
			</div>

			<div className="relative-container">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onNodeClick={onNodeClick}
					onEdgeClick={onEdgeClick} // ★追加: エッジクリック
					onPaneClick={onPaneClick}
					nodesConnectable={false}
					connectionMode="loose"
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
				>
					<Controls />
					<Background variant="dots" gap={12} size={1} />
				</ReactFlow>

				<SidePanel
					isOpen={!!selection}
					selection={selection} // 選択オブジェクト {type, data}
					onClose={() => setSelection(null)}
					onSave={handleSaveFromPanel}
					onDelete={handleDeleteFromPanel}
					availableTags={tags}
					onAddTag={handleAddTag}
					allNodes={nodes} // パネル内での参照用
					allEdges={edges} // パネル内での参照用
				/>
			</div>

			<TagManagerModal
				isOpen={isTagManagerOpen}
				onClose={() => setIsTagManagerOpen(false)}
				tags={tags}
				onDeleteTag={handleDeleteTag}
				onAddTag={handleAddTag}
			/>
		</div>
	);
}
