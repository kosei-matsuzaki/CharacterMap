import { useCallback } from "react";
import { getStraightPath, useStore } from "reactflow";
import { getEdgeParams } from "../../utils/utils";

export default function SimpleFloatingEdge({
	id,
	source,
	target,
	style, // ★ここにHookからの stroke (色) が入ってくる
	label,
}) {
	const sourceNode = useStore(
		useCallback((store) => store.nodeInternals.get(source), [source])
	);
	const targetNode = useStore(
		useCallback((store) => store.nodeInternals.get(target), [target])
	);

	if (!sourceNode || !targetNode) {
		return null;
	}

	const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

	const opacity = style?.opacity ?? 1;
	// ★追加: スタイルに stroke (色) が指定されていればそれを使う。なければデフォルトのグレー
	const color = style?.stroke || "#b1b1b7";

	// --- 矢印と線の座標計算 ---
	const angle = Math.atan2(ty - sy, tx - sx);
	const arrowLength = 14;
	const arrowWidth = 7;

	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	const p1x = tx - arrowLength * cos + arrowWidth * sin;
	const p1y = ty - arrowLength * sin - arrowWidth * cos;

	const p2x = tx - arrowLength * cos - arrowWidth * sin;
	const p2y = ty - arrowLength * sin + arrowWidth * cos;

	// 常に矢印パスを作成
	const arrowPath = `M ${tx} ${ty} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`;

	// 常に線の終点を手前にずらす
	const lineTargetX = tx - (arrowLength - 2) * cos;
	const lineTargetY = ty - (arrowLength - 2) * sin;

	// 線のパス生成
	const [edgePath, labelX, labelY] = getStraightPath({
		sourceX: sx,
		sourceY: sy,
		targetX: lineTargetX,
		targetY: lineTargetY,
	});

	return (
		<>
			{/* クリック判定用の透明な太い線 */}
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

			{/* 本来の見える線 */}
			<path
				id={id}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd={undefined}
				// styleには strokeColor が含まれているので、線は自動的にその色になる
				style={style}
			/>

			{/* 矢印 (常に描画) */}
			<path
				d={arrowPath}
				className="edge-arrow"
				// ★修正: fill に抽出した color を適用することで、線と矢印の色を合わせる
				style={{ opacity, fill: color }}
			/>

			{/* ラベル */}
			{label && (
				<text
					x={labelX}
					y={labelY - 10}
					textAnchor="middle"
					style={{
						fontSize: 12,
						fill: color, // ★修正: テキストも色を合わせる
						fontWeight: "bold",
						pointerEvents: "none",
						opacity,
					}}
				>
					{label}
				</text>
			)}
		</>
	);
}
