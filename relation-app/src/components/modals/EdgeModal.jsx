import { useState } from "react";
import { MarkerType } from "reactflow";
import { STYLES } from "../../constants";
import TagSelector from "../diagram/TagSelector";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

// ラッパーコンポーネント
export default function EdgeModal(props) {
	if (!props.isOpen) return null;
	return <EdgeModalContent {...props} />;
}

// 中身のコンポーネント
function EdgeModalContent({
	onClose,
	editingEdgeId,
	initialData,
	nodes,
	availableTags,
	onSave,
	onDelete,
	onAddTag,
}) {
	const [source, setSource] = useState(initialData?.source || "");
	const [target, setTarget] = useState(initialData?.target || "");
	const [text, setText] = useState(initialData?.text || "");
	const [edgeTags, setEdgeTags] = useState(initialData?.tags || []);

	// ★削除: type (arrow/line) のステートは不要になりました

	const handleSave = () => {
		if (!source || !target) return alert("始点と終点を選んでください");
		if (source === target) return alert("自分自身には接続できません");

		// ★修正: 条件分岐を削除し、常に矢印の設定オブジェクトを作成
		const markerEnd = {
			type: MarkerType.ArrowClosed,
			color: "currentColor",
			width: 20,
			height: 20,
		};

		onSave({ source, target, text, tags: edgeTags, markerEnd });
		onClose();
	};

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title="関係の設定"
			footer={
				<>
					<Button onClick={handleSave}>
						{editingEdgeId ? "更新" : "接続"}
					</Button>
					{editingEdgeId && (
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
			<div style={STYLES.flexCenter}>
				<div style={{ flex: 1 }}>
					<label style={STYLES.label}>誰から</label>
					<select
						value={source}
						onChange={(e) => setSource(e.target.value)}
						style={STYLES.input}
					>
						<option value="">選択...</option>
						{nodes.map((n) => (
							<option key={n.id} value={n.id}>
								{n.data.label}
							</option>
						))}
					</select>
				</div>
				<div>➡</div>
				<div style={{ flex: 1 }}>
					<label style={STYLES.label}>誰へ</label>
					<select
						value={target}
						onChange={(e) => setTarget(e.target.value)}
						style={STYLES.input}
					>
						<option value="">選択...</option>
						{nodes.map((n) => (
							<option key={n.id} value={n.id}>
								{n.data.label}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* ★削除: ラジオボタン(矢印/実線)のUIを削除しました */}

			<div style={{ marginTop: "10px" }}>
				<Input
					label="関係の説明"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
			</div>

			<TagSelector
				availableTags={availableTags}
				selectedTags={edgeTags}
				onTagChange={setEdgeTags}
				onCreateTag={onAddTag}
			/>
		</Modal>
	);
}
