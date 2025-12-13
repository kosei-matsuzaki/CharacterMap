import { STYLES } from "../../constants";

// ★修正: containerStyle を受け取れるように変更
export default function Input({ label, textarea, containerStyle, ...props }) {
	return (
		<div style={{ marginBottom: "8px", ...containerStyle }}>
			{label && <label style={STYLES.label}>{label}</label>}
			{textarea ? (
				<textarea style={{ ...STYLES.input, minHeight: "60px" }} {...props} />
			) : (
				<input style={STYLES.input} {...props} />
			)}
		</div>
	);
}
