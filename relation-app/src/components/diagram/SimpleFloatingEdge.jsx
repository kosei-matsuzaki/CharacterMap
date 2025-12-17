import { useCallback } from "react";
import { getStraightPath, useStore } from "reactflow";
import { getEdgeParams } from "../../utils/utils";

export default function SimpleFloatingEdge({
	id,
	source,
	target,
	style,
	label,
}) {
	const sourceNode = useStore(
		useCallback((store) => store.nodeInternals.get(source), [source])
	);
	const targetNode = useStore(
		useCallback((store) => store.nodeInternals.get(target), [target])
	);

	const edges = useStore((s) => s.edges);
	const hasBidirectionalEdge = edges.some(
		(e) => e.source === target && e.target === source && e.id !== id
	);

	if (!sourceNode || !targetNode) {
		return null;
	}

	// 1. まずは通常の（中心に向かう）接続点を計算
	let { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

	// 2. 双方向エッジがある場合、座標を平行移動させてからノード範囲内に収める
	if (hasBidirectionalEdge) {
		const offset = 18; // ずらす距離

		// ベクトル計算
		const centerSourceX = sourceNode.position.x + (sourceNode.width || 85) / 2;
		const centerSourceY =
			sourceNode.position.y + (sourceNode.height || 100) / 2;
		const centerTargetX = targetNode.position.x + (targetNode.width || 85) / 2;
		const centerTargetY =
			targetNode.position.y + (targetNode.height || 100) / 2;

		const dx = centerTargetX - centerSourceX;
		const dy = centerTargetY - centerSourceY;
		const len = Math.sqrt(dx * dx + dy * dy) || 1;

		// 進行方向に対して「右側」への法線ベクトル
		const nx = (-dy / len) * offset;
		const ny = (dx / len) * offset;

		// 座標をずらす (単純加算により、距離に関係なく平行を維持)
		sx += nx;
		sy += ny;
		tx += nx;
		ty += ny;

		// --- クランプ処理 (Adhere to Node) ---
		// ずらした結果、ノードの領域外に出てしまった場合は枠線上（角）に戻す

		// Sourceノードの範囲
		const sX = sourceNode.position.x;
		const sY = sourceNode.position.y;
		const sW = sourceNode.width || 85;
		const sH = sourceNode.height || 100;
		// 範囲内に制限
		sx = Math.max(sX, Math.min(sX + sW, sx));
		sy = Math.max(sY, Math.min(sY + sH, sy));

		// Targetノードの範囲
		const tX = targetNode.position.x;
		const tY = targetNode.position.y;
		const tW = targetNode.width || 85;
		const tH = targetNode.height || 100;
		// 範囲内に制限
		tx = Math.max(tX, Math.min(tX + tW, tx));
		ty = Math.max(tY, Math.min(tY + tH, ty));
	}

	const opacity = style?.opacity ?? 1;
	const strokeColor = style?.stroke || "#b1b1b7";

	// --- 矢印の形状計算 ---
	const angle = Math.atan2(ty - sy, tx - sx);
	const arrowLength = 14;
	const arrowWidth = 7;

	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	const p1x = tx - arrowLength * cos + arrowWidth * sin;
	const p1y = ty - arrowLength * sin - arrowWidth * cos;
	const p2x = tx - arrowLength * cos - arrowWidth * sin;
	const p2y = ty - arrowLength * sin + arrowWidth * cos;

	const arrowPath = `M ${tx} ${ty} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`;

	const lineTargetX = tx - (arrowLength - 2) * cos;
	const lineTargetY = ty - (arrowLength - 2) * sin;

	const [edgePath, labelX, labelY] = getStraightPath({
		sourceX: sx,
		sourceY: sy,
		targetX: lineTargetX,
		targetY: lineTargetY,
	});

	return (
		<>
			<path
				d={edgePath}
				style={{
					strokeWidth: 30,
					stroke: "transparent",
					fill: "none",
					cursor: "pointer",
					pointerEvents: "stroke",
				}}
			/>

			<path
				id={id}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd={undefined}
				style={{ ...style, fill: "none" }}
			/>

			<path
				d={arrowPath}
				className="edge-arrow"
				style={{ opacity, fill: strokeColor }}
			/>

			{label && (
				<text
					x={labelX}
					y={labelY - (hasBidirectionalEdge ? 0 : 10)}
					textAnchor="middle"
					style={{
						fontSize: 12,
						fontWeight: "bold",
						pointerEvents: "none",
						opacity,
						fill: "#333",
						stroke: "white",
						strokeWidth: "3px",
						paintOrder: "stroke",
					}}
				>
					{label}
				</text>
			)}
		</>
	);
}
