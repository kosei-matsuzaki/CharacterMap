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

import {
	DEFAULT_EDGE_OPTIONS,
	EDGE_TYPES,
	NODE_TYPES,
	STYLES,
} from "../constants";
import { useDiagramFilter } from "../hooks/useDiagramFilter";
import { getLayoutedElements } from "../utils/utils";

import EdgeModal from "../components/modals/EdgeModal";
import PersonModal from "../components/modals/PersonModal";
import TagManagerModal from "../components/modals/TagManagerModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Editor() {
	const { id } = useParams();
	const navigate = useNavigate();

	const initialData = useMemo(() => {
		try {
			const savedData = JSON.parse(localStorage.getItem("my-diagrams") || "{}");
			const data = savedData[id] || {
				nodes: [],
				edges: [],
				name: "新規相関図",
				tags: [],
			};
			if (!data.tags) data.tags = [];
			return data;
		} catch (error) {
			console.error(error);
			return { nodes: [], edges: [], name: "新規相関図", tags: [] };
		}
	}, [id]);

	const nodeTypes = useMemo(() => NODE_TYPES, []);
	const edgeTypes = useMemo(() => EDGE_TYPES, []);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);
	const [tags, setTags] = useState(initialData.tags);
	const [diagramName, setDiagramName] = useState(initialData.name);

	// ★修正: フィルタは配列([])ではなく、単一ID(null or string)にする
	const [activeTagId, setActiveTagId] = useState(null);

	const [personModal, setPersonModal] = useState({
		isOpen: false,
		editId: null,
		data: null,
	});
	const [edgeModal, setEdgeModal] = useState({
		isOpen: false,
		editId: null,
		data: null,
	});
	const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

	const { fitView } = useReactFlow();

	useEffect(() => {
		window.requestAnimationFrame(() => fitView({ padding: 0.2 }));
	}, [fitView]);

	// ★修正: 単一選択フィルタHookを使用 (tagsリストも渡す)
	useDiagramFilter(nodes, edges, setNodes, setEdges, activeTagId, tags);

	// --- アクション ---
	const openPersonModal = (node = null) => {
		setPersonModal({
			isOpen: true,
			editId: node?.id || null,
			// ★修正: node.data に tags が含まれている可能性があるためそのまま渡す
			data: node ? node.data : { tags: [] },
		});
	};

	const handleSavePerson = (data) => {
		if (personModal.editId) {
			setNodes((nds) =>
				nds.map((n) =>
					n.id === personModal.editId
						? { ...n, data: { ...n.data, ...data } }
						: n
				)
			);
		} else {
			const newNode = {
				id: crypto.randomUUID(),
				type: "person",
				position: { x: 0, y: 0 },
				data, // dataにはtagsが含まれるようになる
			};
			setNodes((nds) => nds.concat(newNode));
		}
	};

	// ... (handleDeletePerson, openEdgeModal, handleSaveEdge, handleDeleteEdge は変更なし) ...
	// ※ 省略しますが、既存の handleSaveEdge などはそのまま使ってください。

	const handleDeletePerson = () => {
		if (window.confirm("削除しますか？")) {
			setNodes((nds) => nds.filter((n) => n.id !== personModal.editId));
			setPersonModal({ isOpen: false, editId: null, data: null });
		}
	};

	const openEdgeModal = (edge = null) => {
		let data = {};
		if (edge) {
			data = {
				source: edge.source,
				target: edge.target,
				text: edge.data?.text,
				tags: edge.data?.tags,
			};
		}
		setEdgeModal({ isOpen: true, editId: edge?.id || null, data });
	};

	const handleSaveEdge = ({ source, target, text, tags, markerEnd }) => {
		const edgeData = { text, tags };
		const label = text;
		const edgeStyle = { strokeWidth: 4 };

		const createEdgeObject = (originalEdge, isNew = false) => {
			const base = {
				...originalEdge,
				source,
				target,
				label,
				style: { ...(originalEdge?.style || {}), ...edgeStyle },
				data: edgeData,
			};

			if (isNew) {
				base.id = `e${source}-${target}-${Date.now()}`;
				base.type = "floating";
			}

			if (markerEnd) {
				base.markerEnd = markerEnd;
			}

			return base;
		};

		if (edgeModal.editId) {
			setEdges((eds) =>
				eds.map((e) => {
					if (e.id === edgeModal.editId) {
						return createEdgeObject(e);
					}
					return e;
				})
			);
		} else {
			const newEdge = createEdgeObject({}, true);
			setEdges((eds) => addEdge(newEdge, eds));
		}

		setEdgeModal({ isOpen: false, editId: null, data: null });
	};

	const handleDeleteEdge = () => {
		if (window.confirm("この関係線を削除しますか？")) {
			setEdges((eds) => eds.filter((e) => e.id !== edgeModal.editId));
			setEdgeModal({ isOpen: false, editId: null, data: null });
		}
	};

	const handleAddTag = (newTag) => {
		setTags([...tags, newTag]);
		// エッジモーダルが開いていれば反映
		if (edgeModal.isOpen) {
			setEdgeModal((prev) => ({
				...prev,
				data: { ...prev.data, tags: [...(prev.data?.tags || []), newTag.id] },
			}));
		}
		// ★追加: 人物モーダルが開いていれば反映
		if (personModal.isOpen) {
			setPersonModal((prev) => ({
				...prev,
				data: { ...prev.data, tags: [...(prev.data?.tags || []), newTag.id] },
			}));
		}
	};

	const handleDeleteTag = (tagId) => {
		if (!window.confirm("削除しますか？")) return;
		setTags((prev) => prev.filter((t) => t.id !== tagId));

		// エッジのタグ削除
		setEdges((prev) =>
			prev.map((e) => ({
				...e,
				data: {
					...e.data,
					tags: (e.data?.tags || []).filter((id) => id !== tagId),
				},
			}))
		);
		// ★追加: ノードのタグ削除
		setNodes((prev) =>
			prev.map((n) => ({
				...n,
				data: {
					...n.data,
					tags: (n.data?.tags || []).filter((id) => id !== tagId),
				},
			}))
		);

		// フィルタ中のタグなら解除
		if (activeTagId === tagId) setActiveTagId(null);
	};

	const handleSaveDiagram = () => {
		// エッジのクリーンアップ
		const cleanEdges = edges.map((e) => ({
			...e,
			style: {
				...e.style,
				opacity: 1,
				strokeWidth: 4,
				stroke: undefined, // 色は保存しない
			},
		}));

		// ノードのクリーンアップ
		const cleanNodes = nodes.map((n) => ({
			...n,
			style: {
				...n.style,
				opacity: 1,
			},
			// ★修正: フィルタ用の一時的な色情報(highlightColor)を削除して保存
			data: {
				...n.data,
				highlightColor: undefined,
			},
		}));

		const savedData = JSON.parse(localStorage.getItem("my-diagrams") || "{}");
		savedData[id] = {
			id,
			name: diagramName,
			nodes: cleanNodes, // クリーンアップ済みのノードを保存
			edges: cleanEdges,
			tags,
			updatedAt: new Date().toLocaleString(),
		};

		try {
			localStorage.setItem("my-diagrams", JSON.stringify(savedData));
			alert("保存しました！");
			navigate(`/viewer/${id}`);
		} catch (e) {
			console.error(e);
			alert("保存エラー");
		}
	};

	const onLayout = useCallback(() => {
		const layouted = getLayoutedElements(nodes, edges);
		setNodes([...layouted.nodes]);
		setEdges([...layouted.edges]);
		window.requestAnimationFrame(() => fitView());
	}, [nodes, edges, setNodes, setEdges, fitView]);

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* ツールバー */}
			<div
				style={{
					padding: "10px",
					background: "#f0f0f0",
					borderBottom: "1px solid #ccc",
				}}
			>
				<div style={STYLES.flexCenter}>
					<Button variant="secondary" onClick={() => navigate(`/viewer/${id}`)}>
						← 戻る
					</Button>
					<div style={{ flex: 1, maxWidth: "300px" }}>
						<Input
							value={diagramName}
							onChange={(e) => setDiagramName(e.target.value)}
							containerStyle={{ marginBottom: 0 }}
							placeholder="相関図タイトル"
						/>
					</div>
					<Button onClick={() => openPersonModal()}>+ 人物</Button>
					<Button onClick={() => openEdgeModal()}>+ 関係</Button>
					<Button style={{ background: "#9C27B0" }} onClick={onLayout}>
						整列
					</Button>
					<Button
						style={{ background: "#4CAF50", marginLeft: "auto" }}
						onClick={handleSaveDiagram}
					>
						保存
					</Button>
				</div>

				{/* フィルタUI (単一選択に変更) */}
				<div style={{ ...STYLES.flexCenter, marginTop: "10px" }}>
					<span style={STYLES.label}>フィルタ:</span>
					{tags.map((tag) => {
						// ★修正: 単一選択ロジック
						const isActive = activeTagId === tag.id;
						return (
							<button
								key={tag.id}
								onClick={() => setActiveTagId(isActive ? null : tag.id)}
								style={{
									background: isActive ? tag.color.bg : "#eee",
									// アクティブ時は文字色を強調、かつ太字に
									color: isActive ? tag.color.text : "#aaa",
									border: isActive
										? `2px solid ${tag.color.text}`
										: "1px solid #ccc",
									fontWeight: isActive ? "bold" : "normal",
									borderRadius: "12px",
									padding: "2px 8px",
									fontSize: "11px",
									cursor: "pointer",
									opacity: 1, // 常に不透明で見やすく
								}}
							>
								{tag.label}
							</button>
						);
					})}
					{activeTagId && (
						<button
							onClick={() => setActiveTagId(null)}
							style={{
								fontSize: "10px",
								border: "none",
								background: "none",
								color: "blue",
								cursor: "pointer",
							}}
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

			<div style={{ flex: 1 }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onNodeClick={(e, node) => openPersonModal(node)}
					onEdgeClick={(e, edge) => openEdgeModal(edge)}
					nodesConnectable={false}
					connectionMode="loose"
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
				>
					<Controls />
					<Background variant="dots" gap={12} size={1} />
				</ReactFlow>
			</div>

			<PersonModal
				isOpen={personModal.isOpen}
				onClose={() => setPersonModal({ ...personModal, isOpen: false })}
				editingNodeId={personModal.editId}
				initialData={personModal.data}
				onSave={handleSavePerson}
				onDelete={handleDeletePerson}
				// ★追加: タグ関連のPropsを渡す
				availableTags={tags}
				onAddTag={handleAddTag}
			/>

			<EdgeModal
				isOpen={edgeModal.isOpen}
				onClose={() => setEdgeModal({ ...edgeModal, isOpen: false })}
				editingEdgeId={edgeModal.editId}
				initialData={edgeModal.data}
				nodes={nodes}
				availableTags={tags}
				onSave={handleSaveEdge}
				onDelete={handleDeleteEdge}
				onAddTag={handleAddTag}
			/>

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
