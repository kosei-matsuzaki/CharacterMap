import { useState } from "react";
import TagSelector from "../diagram/TagSelector"; // ★追加
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

export default function PersonModal(props) {
	if (!props.isOpen) return null;
	return <PersonModalContent {...props} />;
}

function PersonModalContent({
	onClose,
	editingNodeId,
	initialData,
	onSave,
	onDelete,
	// ★追加: タグ関連のProps
	availableTags,
	onAddTag,
}) {
	const [name, setName] = useState(initialData?.label || "");
	const [desc, setDesc] = useState(initialData?.description || "");
	const [image, setImage] = useState(initialData?.image || null);
	// ★追加: 人物タグのState
	const [personTags, setPersonTags] = useState(initialData?.tags || []);

	const handleSave = () => {
		if (!name) return alert("名前を入力してください");
		// ★修正: tags も保存データに含める
		onSave({ label: name, description: desc, image, tags: personTags });
		onClose();
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setImage(reader.result);
			reader.readAsDataURL(file);
		}
	};

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title={editingNodeId ? "人物の編集" : "人物の追加"}
			footer={
				<>
					<Button onClick={handleSave}>
						{editingNodeId ? "更新" : "追加"}
					</Button>
					{editingNodeId && (
						<Button variant="danger" onClick={onDelete}>
							削除
						</Button>
					)}
					<Button variant="secondary" onClick={onClose}>
						キャンセル
					</Button>
				</>
			}
		>
			<Input
				label="名前"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<Input
				label="画像"
				type="file"
				accept="image/*"
				onChange={handleImageChange}
			/>
			{image && (
				<img
					src={image}
					alt="preview"
					style={{
						width: "50px",
						height: "50px",
						objectFit: "cover",
						borderRadius: "50%",
					}}
				/>
			)}
			<Input
				label="説明文"
				textarea
				value={desc}
				onChange={(e) => setDesc(e.target.value)}
				rows={3}
			/>

			{/* ★追加: タグセレクター */}
			<TagSelector
				availableTags={availableTags}
				selectedTags={personTags}
				onTagChange={setPersonTags}
				onCreateTag={onAddTag}
			/>
		</Modal>
	);
}
