import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
	Background,
	Controls,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import Button from "../components/ui/Button";
import { EDGE_TYPES, NODE_TYPES, STYLES } from "../constants";
import { useDiagramFilter } from "../hooks/useDiagramFilter";

export default function Viewer() {
	const { id } = useParams();
	const navigate = useNavigate();

	const initialData = useMemo(() => {
		try {
			const savedData = JSON.parse(localStorage.getItem("my-diagrams") || "{}");
			const data = savedData[id] || {
				nodes: [],
				edges: [],
				name: "データなし",
				tags: [],
			};
			if (!data.tags) data.tags = [];
			return data;
		} catch (error) {
			console.error(error);
			return { nodes: [], edges: [], name: "エラー", tags: [] };
		}
	}, [id]);

	const nodeTypes = useMemo(() => NODE_TYPES, []);
	const edgeTypes = useMemo(() => EDGE_TYPES, []);

	const [nodes, setNodes] = useNodesState(initialData.nodes);
	const [edges, setEdges] = useEdgesState(initialData.edges);
	const tags = initialData.tags || [];

	// ★修正: 単一選択ID
	const [activeTagId, setActiveTagId] = useState(null);

	const { fitView } = useReactFlow();

	useEffect(() => {
		window.requestAnimationFrame(() => fitView({ padding: 0.2 }));
	}, [fitView]);

	// ★修正: 単一選択フックを使用 (tagsリストも渡す)
	useDiagramFilter(nodes, edges, setNodes, setEdges, activeTagId, tags);

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					padding: "10px 20px",
					background: "#f8f9fa",
					borderBottom: "1px solid #ddd",
				}}
			>
				<div
					style={{
						...STYLES.flexCenter,
						justifyContent: "space-between",
						marginBottom: "10px",
					}}
				>
					<div style={STYLES.flexCenter}>
						<Button variant="secondary" onClick={() => navigate("/")}>
							← 一覧へ
						</Button>
						<h2 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
							{initialData.name}
						</h2>
					</div>
					<Button onClick={() => navigate(`/editor/${id}`)}>✎ 編集する</Button>
				</div>

				{/* フィルタUI (単一選択) */}
				<div style={STYLES.flexCenter}>
					<span style={STYLES.label}>フィルタ:</span>
					{tags.map((tag) => {
						const isActive = activeTagId === tag.id;
						return (
							<button
								key={tag.id}
								onClick={() => setActiveTagId(isActive ? null : tag.id)}
								style={{
									background: isActive ? tag.color.bg : "#eee",
									color: isActive ? tag.color.text : "#aaa",
									border: isActive
										? `2px solid ${tag.color.text}`
										: "1px solid #ccc",
									fontWeight: isActive ? "bold" : "normal",
									borderRadius: "12px",
									padding: "2px 8px",
									fontSize: "11px",
									cursor: "pointer",
									opacity: 1,
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
				</div>
			</div>

			<div style={{ flex: 1 }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodesDraggable={false}
					nodesConnectable={false}
					elementsSelectable={false}
					zoomOnDoubleClick={false}
					connectionMode="loose"
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
				>
					<Controls showInteractive={false} />
					<Background variant="dots" gap={12} size={1} />
				</ReactFlow>
			</div>
		</div>
	);
}
