import dagre from "dagre";
import { Position } from "reactflow";
import { TAG_COLORS } from "../constants";

// ノードの中心座標を取得
function getNodeCenter(node) {
	// width/heightがまだ計測されていない場合(初期ロード直後など)のフォールバック値
	const w = node.width || 100;
	const h = node.height || 80; // 高さは文字数によるが仮置き

	return {
		x: node.position.x + w / 2,
		y: node.position.y + h / 2,
	};
}

// ★修正: 長方形（角丸）の境界線との交点を計算する関数
function getHandlePosition(node, targetNode) {
	const sourceCenter = getNodeCenter(node);
	const targetCenter = getNodeCenter(targetNode);

	// 2つのノード間のベクトル
	const dx = targetCenter.x - sourceCenter.x;
	const dy = targetCenter.y - sourceCenter.y;

	// ノードのハーフサイズ（中心から端までの距離）
	// CSSで width: 100px としているので、w=50
	// 高さは可変ですが、ReactFlowが計測した node.height を使用
	const w = (node.width || 100) / 2;
	const h = (node.height || 80) / 2;

	// --- 長方形との交点計算ロジック ---

	// 角度（ラジアン）
	// 0 は右、Math.PI/2 は下、Math.PI は左、-Math.PI/2 は上
	const angle = Math.atan2(dy, dx);

	// 長方形の対角線の角度（絶対値）を計算
	// これより急な角度なら上下の辺、緩やかなら左右の辺に当たる
	const slope = Math.atan2(h, w);

	let x, y;

	// 角度の絶対値をとって象限を無視し、幾何学的に計算
	const absAngle = Math.abs(angle);

	// --- 場合分け ---

	// 1. 左右の辺に当たる場合 (角度が対角線より浅い)
	// 右: (-slope < angle < slope) -> cos > 0
	// 左: (angle > PI-slope || angle < -PI+slope) -> cos < 0
	if (absAngle <= slope || absAngle > Math.PI - slope) {
		// x座標は「右端」か「左端」
		const xOffset = Math.cos(angle) > 0 ? w : -w;
		x = sourceCenter.x + xOffset;

		// y座標は比率で求める: y = x * tan(angle)
		// ただし中心基準なので、offset * tan(angle)
		y = sourceCenter.y + xOffset * Math.tan(angle);
	}
	// 2. 上下の辺に当たる場合 (角度が対角線より急)
	else {
		// y座標は「下端」か「上端」
		const yOffset = Math.sin(angle) > 0 ? h : -h;
		y = sourceCenter.y + yOffset;

		// x座標は比率で求める: x = y / tan(angle)
		// ただし中心基準なので、offset / tan(angle)
		// tan(angle)が0に近いケースは上のif文で除外されているので安全
		x = sourceCenter.x + yOffset / Math.tan(angle);
	}

	// --- オフセット調整 (矢印が隠れないように少し外へずらす) ---
	// CSSの border-radius や box-shadow、矢印のサイズを考慮して微調整
	// 矢印の先端がノード境界ぴったりだと隠れる場合があるので、ベクトル方向に少し伸ばす
	const offset = 4; // ピクセル単位で調整してください
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance > 0) {
		// 単位ベクトル化してオフセット分加算
		x += (dx / distance) * offset;
		y += (dy / distance) * offset;
	}

	return { x, y };
}

export function getEdgeParams(source, target) {
	const sourceIntersection = getHandlePosition(source, target);
	const targetIntersection = getHandlePosition(target, source);

	return {
		sx: sourceIntersection.x,
		sy: sourceIntersection.y,
		tx: targetIntersection.x,
		ty: targetIntersection.y,
		sourcePos: Position.Top,
		targetPos: Position.Bottom,
	};
}

export const getRandomTagColor = () => {
	return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
};

export const getLayoutedElements = (nodes, edges) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	dagreGraph.setGraph({
		rankdir: "TB",
		nodesep: 30,
		ranksep: 80,
	});

	nodes.forEach((node) => {
		// CSSに合わせて dagre の計算サイズも調整
		dagreGraph.setNode(node.id, { width: 100, height: 80 });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	const layoutedNodes = nodes.map((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		return {
			...node,
			position: {
				x: nodeWithPosition.x - 50,
				y: nodeWithPosition.y - 40,
			},
		};
	});

	return { nodes: layoutedNodes, edges };
};
