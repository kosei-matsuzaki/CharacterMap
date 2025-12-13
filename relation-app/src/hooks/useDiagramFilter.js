import { useEffect } from "react";

export function useDiagramFilter(
	nodes,
	edges,
	setNodes,
	setEdges,
	activeTagId,
	allTags
) {
	useEffect(() => {
		// --- フィルタなし（リセット） ---
		if (!activeTagId) {
			setNodes((nds) =>
				nds.map((n) => ({
					...n,
					style: { ...n.style, opacity: 1 },
					// ★修正: data内のハイライト情報を削除
					data: { ...n.data, highlightColor: undefined },
				}))
			);
			setEdges((eds) =>
				eds.map((e) => ({
					...e,
					style: {
						...e.style,
						opacity: 1,
						stroke: undefined,
						strokeWidth: 4,
					},
				}))
			);
			return;
		}

		// --- フィルタ適用 ---
		const activeTag = allTags.find((t) => t.id === activeTagId);
		const highlightColor = activeTag ? activeTag.color.text : "#2196F3";

		const activeNodeIds = new Set();
		nodes.forEach((node) => {
			const nodeTags = node.data.tags || [];
			if (nodeTags.includes(activeTagId)) {
				activeNodeIds.add(node.id);
			}
		});

		const activeEdgeIds = new Set();
		edges.forEach((edge) => {
			const edgeTags = edge.data?.tags || [];
			const isEdgeMatch = edgeTags.includes(activeTagId);
			const isSourceActive = activeNodeIds.has(edge.source);
			const isTargetActive = activeNodeIds.has(edge.target);

			if (isEdgeMatch || isSourceActive || isTargetActive) {
				activeEdgeIds.add(edge.id);
				activeNodeIds.add(edge.source);
				activeNodeIds.add(edge.target);
			}
		});

		// 1. ノードの更新
		setNodes((nds) =>
			nds.map((n) => {
				const isActive = activeNodeIds.has(n.id);
				const isTagMatch =
					isActive && (n.data.tags || []).includes(activeTagId);

				return {
					...n,
					style: {
						...n.style,
						opacity: isActive ? 1 : 0.2,
						// style.borderColor は使わず削除
						borderColor: undefined,
					},
					// ★修正: dataプロパティ経由で色を渡す
					data: {
						...n.data,
						highlightColor: isTagMatch ? highlightColor : undefined,
					},
				};
			})
		);

		// 2. エッジの更新 (こちらはstyleでOK)
		setEdges((eds) =>
			eds.map((e) => {
				const isActive = activeEdgeIds.has(e.id);
				return {
					...e,
					style: {
						...e.style,
						opacity: isActive ? 1 : 0.2,
						strokeWidth: 4,
						stroke: isActive ? highlightColor : undefined,
					},
				};
			})
		);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTagId, allTags]);
}
