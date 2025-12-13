import { memo } from "react";
import { Handle, Position } from "reactflow";

const hiddenHandleStyle = {
	opacity: 0,
	width: "1px",
	height: "1px",
	minWidth: 0,
	minHeight: 0,
	border: "none",
	background: "transparent",
};

// ★修正: styleではなく data から色情報を受け取る
const PersonNode = ({ data }) => {
	// data.highlightColor があればそれを使い、なければデフォルト(#777)
	const borderColor = data.highlightColor || "#777";
	const borderWidth = data.highlightColor ? "2px" : "1px";

	return (
		<div
			className="person-node"
			style={{
				padding: "10px",
				borderRadius: "8px",
				background: "white",
				// ★動的なボーダー適用
				border: `${borderWidth} solid ${borderColor}`,
				width: "85px",
				textAlign: "center",
				boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
			}}
		>
			<Handle type="target" position={Position.Top} style={hiddenHandleStyle} />
			<Handle
				type="source"
				position={Position.Bottom}
				style={hiddenHandleStyle}
			/>
			<Handle
				type="target"
				position={Position.Left}
				style={{ ...hiddenHandleStyle, top: "50%" }}
			/>
			<Handle
				type="source"
				position={Position.Right}
				style={{ ...hiddenHandleStyle, top: "50%" }}
			/>

			{data.image && (
				<img
					src={data.image}
					alt={data.label}
					style={{
						width: "60px",
						height: "60px",
						borderRadius: "50%",
						objectFit: "cover",
						marginBottom: "5px",
					}}
				/>
			)}

			<div
				style={{
					fontWeight: "bold",
					fontSize: "12px",
					marginBottom: "4px",
					wordBreak: "break-all",
				}}
			>
				{data.label}
			</div>

			{data.description && (
				<div style={{ fontSize: "9px", color: "#555", lineHeight: "1.2" }}>
					{data.description}
				</div>
			)}
		</div>
	);
};

export default memo(PersonNode);
