import { useState } from "react";
import { TAG_COLORS } from "../../constants";
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

	// ランダムな色を選ぶ関数
	const getRandomColor = () =>
		TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

	const handleAdd = () => {
		if (!newTagName.trim()) return;

		const newTag = {
			id: crypto.randomUUID(),
			label: newTagName.trim(),
			color: getRandomColor(),
		};

		onAddTag(newTag);
		setNewTagName("");
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="タグの管理"
			footer={
				<Button variant="secondary" onClick={onClose}>
					閉じる
				</Button>
			}
		>
			{/* ★追加: 新規タグ追加フォーム */}
			<div
				style={{
					display: "flex",
					gap: "8px",
					alignItems: "flex-end",
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
						containerStyle={{ marginBottom: 0 }} // マージン調整
					/>
				</div>
				<Button onClick={handleAdd}>追加</Button>
			</div>

			<div style={{ maxHeight: "300px", overflowY: "auto" }}>
				{tags.length === 0 ? (
					<p style={{ fontSize: "12px", color: "#777" }}>
						登録されたタグはありません
					</p>
				) : (
					<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
						{tags.map((tag) => (
							<li
								key={tag.id}
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									padding: "8px 0",
									borderBottom: "1px solid #f0f0f0",
								}}
							>
								<span
									style={{
										background: tag.color.bg,
										color: tag.color.text,
										padding: "2px 8px",
										borderRadius: "4px",
										fontSize: "12px",
										fontWeight: "500",
									}}
								>
									{tag.label}
								</span>
								<Button
									variant="danger"
									style={{
										padding: "4px 8px",
										fontSize: "10px",
										minWidth: "50px",
									}}
									onClick={() => onDeleteTag(tag.id)}
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
