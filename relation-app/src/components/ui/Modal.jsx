import { STYLES } from "../../constants";

export default function Modal({ isOpen, onClose, title, children, footer }) {
	if (!isOpen) return null;
	return (
		<div style={STYLES.modalOverlay} onClick={onClose}>
			<div style={STYLES.modalContent} onClick={(e) => e.stopPropagation()}>
				{title && (
					<h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>{title}</h3>
				)}
				{children}
				{footer && (
					// ★修正: justify-content: flex-end を追加してボタンを右寄せに
					// 必要に応じて space-between などに変更してください
					<div
						style={{
							display: "flex",
							gap: "10px",
							marginTop: "10px",
							justifyContent: "flex-end",
						}}
					>
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}
