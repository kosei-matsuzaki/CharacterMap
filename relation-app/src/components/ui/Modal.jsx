import { useEffect } from "react";
// STYLES の import は不要

export default function Modal({ isOpen, onClose, title, children, footer }) {
	// ESCキーで閉じる処理
	useEffect(() => {
		const handleEsc = (e) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-container" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2 className="modal-title">{title}</h2>
					{/* 閉じるボタン (x) */}
					<button
						onClick={onClose}
						style={{
							border: "none",
							background: "none",
							fontSize: "20px",
							cursor: "pointer",
							color: "#999",
						}}
					>
						×
					</button>
				</div>

				<div className="modal-body">{children}</div>

				{footer && <div className="modal-footer">{footer}</div>}
			</div>
		</div>
	);
}
