import { useEffect } from "react";
import { IconX } from "./Icons";

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	footer,
	isCheck,
}) {
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
					{!isCheck && (
						<button className="modal-close-btn" onClick={onClose}>
							<IconX size={20} />
						</button>
					)}
				</div>

				<div className="modal-body">{children}</div>

				{footer && <div className="modal-footer">{footer}</div>}
			</div>
		</div>
	);
}
