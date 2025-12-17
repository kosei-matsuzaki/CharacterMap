import { memo } from "react";
import { Handle, Position } from "reactflow";
import defaultImage from "../../assets/noImage.jpg";

const hiddenHandleStyle = {
	opacity: 0,
	width: "1px",
	height: "1px",
	minWidth: 0,
	minHeight: 0,
	border: "none",
	background: "transparent",
};

const PersonNode = ({ data }) => {
	const borderColor = data.highlightColor || "#777";
	const borderWidth = data.highlightColor ? "2px" : "1px";

	return (
		<div
			className="person-node"
			// ★動的な値（ボーダー）のみインラインに残す
			style={{
				border: `${borderWidth} solid ${borderColor}`,
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

			<img
				src={data.image || defaultImage}
				alt={data.label}
				className="person-node-image"
			/>

			<div className="person-node-label">{data.label}</div>

			{data.description && (
				<div className="person-node-desc">{data.description}</div>
			)}
		</div>
	);
};

export default memo(PersonNode);
