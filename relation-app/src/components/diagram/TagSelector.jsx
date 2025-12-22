import { useState } from "react";
import { TAG_COLORS } from "../../constants"; // 色定義は定数として使用
import Button from "../ui/Button";
import { IconPlus, IconX } from "../ui/Icons";
import Input from "../ui/Input";

export default function TagSelector({
	availableTags,
	selectedTags, // IDの配列
	onTagChange,
	onCreateTag,
}) {
	const [isCreating, setIsCreating] = useState(false);
	const [newTagName, setNewTagName] = useState("");

	const toggleTag = (tagId) => {
		if (selectedTags.includes(tagId)) {
			onTagChange(selectedTags.filter((id) => id !== tagId));
		} else {
			onTagChange([...selectedTags, tagId]);
		}
	};

	const handleCreate = () => {
		if (!newTagName.trim()) return;
		const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
		const newTag = {
			id: crypto.randomUUID(),
			label: newTagName.trim(),
			color,
		};
		onCreateTag(newTag);
		onTagChange([...selectedTags, newTag.id]);
		setNewTagName("");
		setIsCreating(false);
	};

	return (
		<div style={{ marginBottom: "15px" }}>
			<label className="input-label">タグ設定</label>

			{/* 既存タグリスト */}
			<div className="tag-list">
				{availableTags.map((tag) => {
					const isSelected = selectedTags.includes(tag.id);
					return (
						<span
							key={tag.id}
							onClick={() => toggleTag(tag.id)}
							className={`tag-chip ${isSelected ? "selected" : ""}`}
							style={{
								background: isSelected ? tag.color.bg : "#eee",
								color: isSelected ? tag.color.text : "#aaa",
								// selectedクラスで border-color: currentColor が適用されるので
								// ここでは非選択時の border を制御
								border: isSelected ? undefined : "1px solid #ccc",
							}}
						>
							{tag.label}
						</span>
					);
				})}

				{/* 新規作成ボタン (小さな＋ボタン) */}
				{!isCreating && (
					<button
						onClick={() => setIsCreating(true)}
						// height制限がなくなったので padding が効きます
						style={{
							border: "1px dashed #ccc",
							background: "none",
							borderRadius: "12px",
							padding: "4px 10px", // 少し広げる
							fontSize: "11px",
							cursor: "pointer",
							color: "#777",
							display: "inline-flex",
							alignItems: "center",
							gap: "4px",
						}}
					>
						<IconPlus size={12} /> 作成
					</button>
				)}
			</div>

			{/* 新規作成フォーム */}
			{isCreating && (
				<div className="flex-center" style={{ marginTop: "10px" }}>
					<div style={{ flex: 1 }}>
						<Input
							placeholder="新しいタグ名"
							value={newTagName}
							onChange={(e) => setNewTagName(e.target.value)}
							containerStyle={{ marginBottom: 0 }}
						/>
					</div>
					<Button onClick={handleCreate} className="btn-sm">
						<IconPlus size={14} /> 追加
					</Button>

					{/* 閉じるボタン: btn-sm を適用 */}
					<Button
						variant="secondary"
						onClick={() => setIsCreating(false)}
						className="btn-sm"
					>
						<IconX size={16} />
					</Button>
				</div>
			)}
		</div>
	);
}
