import { useState } from "react";
import { TAG_COLORS } from "../../constants";
import { useDialog } from "../../contexts/DialogContext";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

export default function TagManagerModal({
	isOpen,
	onClose,
	tags,
	onDeleteTag,
	onAddTag,
}) {
	const [newTagName, setNewTagName] = useState("");
	const { showConfirm, showAlert } = useDialog();

	const getRandomColor = () =>
		TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

	const handleAdd = () => {
		if (!newTagName.trim()) {
			return showAlert("タグ名を入力してください", "入力エラー");
		}

		const newTag = {
			id: crypto.randomUUID(),
			label: newTagName.trim(),
			color: getRandomColor(),
		};

		onAddTag(newTag);
		setNewTagName("");
	};

	const handleDeleteClick = (tagId) => {
		showConfirm(
			"このタグを削除しますか？\n設定されているすべての人物や関係線からもタグが外れます。",
			() => onDeleteTag(tagId),
			"タグ削除の確認"
		);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="タグの管理" isCheck={false}>
			{/* 新規追加フォーム */}
			<div
				className="flex-center"
				style={{
					marginBottom: "15px",
					paddingBottom: "10px",
					borderBottom: "1px solid #eee",
				}}
			>
				<div style={{ flex: 1 }}>
					<Input
						placeholder="新しいタグ名"
						value={newTagName}
						onChange={(e) => setNewTagName(e.target.value)}
						containerStyle={{ marginBottom: 0 }}
					/>
				</div>
				<Button onClick={handleAdd}>追加</Button>
			</div>

			{/* タグ一覧 */}
			<div style={{ maxHeight: "300px", overflowY: "auto" }}>
				{tags.length === 0 ? (
					<p style={{ fontSize: "12px", color: "var(--text-light)" }}>
						登録されたタグはありません
					</p>
				) : (
					<ul className="tag-manager-list">
						{tags.map((tag) => (
							<li key={tag.id} className="tag-manager-item">
								<span
									className="tag-manager-label"
									style={{
										background: tag.color.bg,
										color: tag.color.text,
									}}
								>
									{tag.label}
								</span>
								<Button
									variant="danger"
									className="btn-sm"
									onClick={() => handleDeleteClick(tag.id)}
								>
									削除
								</Button>
							</li>
						))}
					</ul>
				)}
			</div>
		</Modal>
	);
}
