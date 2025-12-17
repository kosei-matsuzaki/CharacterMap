export default function LoadingOverlay({ isVisible, message }) {
	if (!isVisible) return null;

	return (
		<div className="loading-overlay">
			<div className="loading-spinner"></div>
			<div className="loading-text">{message || "Loading..."}</div>
		</div>
	);
}
