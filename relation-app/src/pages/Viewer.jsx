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
import SidePanel from "../components/ui/SidePanel";
import { EDGE_TYPES, NODE_TYPES } from "../constants";
import { useDiagramFilter } from "../hooks/useDiagramFilter";

import { useLoading } from "../contexts/LoadingContext";
import { Diagram } from "../models";
import { DiagramRepository } from "../services/DiagramRepository";

export default function Viewer() {
	const { id } = useParams();
	const navigate = useNavigate();

	const initialDiagram = useMemo(() => {
		const diagram = DiagramRepository.getById(id);
		return diagram || new Diagram({ id, name: "データなし" });
	}, [id]);

	const nodeTypes = useMemo(() => NODE_TYPES, []);
	const edgeTypes = useMemo(() => EDGE_TYPES, []);

	const [nodes, setNodes] = useNodesState(
		initialDiagram.people.map((p) => p.toNode())
	);
	const [edges, setEdges] = useEdgesState(
		initialDiagram.relationships.map((r) => r.toEdge())
	);
	const tags = initialDiagram.tags;

	const [activeTagId, setActiveTagId] = useState(null);

	// ★修正: Viewerでも selection ステートを使用
	const [selection, setSelection] = useState(null);

	const { fitView } = useReactFlow();
	const { showLoading, hideLoading } = useLoading();

	useEffect(() => {
		showLoading("読み込み中...");
		const timer = setTimeout(() => {
			fitView({ padding: 0.2 });
			hideLoading();
		}, 300);
		return () => clearTimeout(timer);
	}, [fitView, showLoading, hideLoading]);

	useDiagramFilter(nodes, edges, setNodes, setEdges, activeTagId, tags);

	const onNodeClick = (e, node) => {
		setSelection({ type: "node", data: node });
	};
	// ★追加
	const onEdgeClick = (e, edge) => {
		setSelection({ type: "edge", data: edge });
	};
	const onPaneClick = () => {
		setSelection(null);
	};

	return (
		<div className="full-screen">
			<div className="toolbar">
				<div
					className="toolbar-row"
					style={{ justifyContent: "space-between" }}
				>
					<div className="flex-center">
						<Button variant="secondary" onClick={() => navigate("/")}>
							← 一覧へ
						</Button>
						<h2
							style={{ margin: 0, fontSize: "18px", color: "var(--text-main)" }}
						>
							{initialDiagram.name}
						</h2>
					</div>
					<Button onClick={() => navigate(`/editor/${id}`)}>✎ 編集する</Button>
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
							className="filter-clear-btn"
						>
							クリア
						</button>
					)}
				</div>
			</div>

			<div className="relative-container">
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
					onNodeClick={onNodeClick}
					onEdgeClick={onEdgeClick} // ★追加
					onPaneClick={onPaneClick}
				>
					<Controls showInteractive={false} />
					<Background variant="dots" gap={12} size={1} />
				</ReactFlow>

				<SidePanel
					isOpen={!!selection}
					selection={selection}
					onClose={() => setSelection(null)}
					availableTags={tags}
					readOnly={true}
					allNodes={nodes} // 名前解決用
					allEdges={edges} // 関係一覧用
				/>
			</div>
		</div>
	);
}
