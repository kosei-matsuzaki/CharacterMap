import { useState } from "react";
import { getRandomTagColor } from "../../utils/utils";

export default function TagSelector({
	availableTags, // 登録済みの全タグリスト
	selectedTags, // 現在選択されているタグIDの配列
	onTagChange, // 選択状態が変わった時のコールバック
	onCreateTag, // 新規タグ作成時のコールバック
}) {
	const [inputValue, setInputValue] = useState("");

	// 新規タグ作成
	const handleKeyDown = (e) => {
		if (e.key === "Enter" && inputValue.trim()) {
			e.preventDefault();
			// 既存チェック
			const existing = availableTags.find((t) => t.label === inputValue.trim());
			if (existing) {
				if (!selectedTags.includes(existing.id)) {
					onTagChange([...selectedTags, existing.id]);
				}
			} else {
				// 新規作成
				onCreateTag({
					id: crypto.randomUUID(),
					label: inputValue.trim(),
					color: getRandomTagColor(),
				});
			}
			setInputValue("");
		}
	};

	// タグの選択/解除
	const toggleTag = (tagId) => {
		if (selectedTags.includes(tagId)) {
			onTagChange(selectedTags.filter((id) => id !== tagId));
		} else {
			onTagChange([...selectedTags, tagId]);
		}
	};

	return (
		<div style={{ marginTop: "10px" }}>
			<label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>
				タグ / グループ (Enterで追加)
			</label>

			{/* 選択中のタグ表示エリア */}
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "5px",
					padding: "5px",
					border: "1px solid #ccc",
					borderRadius: "4px",
					minHeight: "38px",
					alignItems: "center",
					background: "white",
				}}
			>
				{selectedTags.map((tagId) => {
					const tag = availableTags.find((t) => t.id === tagId);
					if (!tag) return null;
					return (
						<span
							key={tag.id}
							style={{
								background: tag.color.bg,
								color: tag.color.text,
								fontSize: "11px",
								padding: "2px 6px",
								borderRadius: "4px",
								display: "flex",
								alignItems: "center",
								gap: "4px",
							}}
						>
							{tag.label}
							<button
								onClick={() => toggleTag(tag.id)}
								style={{
									border: "none",
									background: "transparent",
									cursor: "pointer",
									padding: 0,
									color: "inherit",
									fontWeight: "bold",
								}}
							>
								×
							</button>
						</span>
					);
				})}

				<input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="タグ名を入力..."
					style={{
						border: "none",
						outline: "none",
						fontSize: "12px",
						flex: 1,
						minWidth: "60px",
					}}
				/>
			</div>

			{/* 既存タグの候補リスト */}
			{availableTags.length > 0 && (
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: "5px",
						marginTop: "5px",
					}}
				>
					{availableTags.map((tag) => {
						const isSelected = selectedTags.includes(tag.id);
						if (isSelected) return null; // 選択済みは表示しない
						return (
							<button
								key={tag.id}
								onClick={() => toggleTag(tag.id)}
								style={{
									background: "white",
									border: "1px solid #ddd",
									fontSize: "10px",
									padding: "2px 6px",
									borderRadius: "10px",
									cursor: "pointer",
									color: "#555",
								}}
							>
								+ {tag.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
