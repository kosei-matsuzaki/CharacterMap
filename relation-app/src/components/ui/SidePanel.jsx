import { useMemo, useState } from "react";
import { MarkerType } from "reactflow";
import defaultImage from "../../assets/noImage.jpg";
import { useDialog } from "../../contexts/DialogContext";
import TagSelector from "../diagram/TagSelector";
import Button from "./Button";
import { IconArrowRight, IconX } from "./Icons";
import Input from "./Input";

// --- 画像プレースホルダー ---
const NoImagePlaceholder = () => (
	<img
		src={defaultImage}
		alt="No Image"
		style={{
			width: "60px",
			height: "60px",
			borderRadius: "50%",
			objectFit: "cover",
			border: "1px solid #ddd",
			background: "#fff",
		}}
	/>
);

// =============================================================================
// 1. 人物用パネルコンテンツ (Person)
// =============================================================================
function PersonPanelContent({
	node,
	onClose,
	onSave,
	onDelete,
	availableTags,
	onAddTag,
	readOnly,
	allEdges,
	allNodes,
}) {
	const isNewNode = node.id.startsWith("new-");
	const [isEditing, setIsEditing] = useState(isNewNode);

	const [label, setLabel] = useState(node.data.label || "");
	const [description, setDescription] = useState(node.data.description || "");
	const [details, setDetails] = useState(node.data.details || "");
	const [image, setImage] = useState(node.data.image || null);
	const [tags, setTags] = useState(node.data.tags || []);

	const { showAlert, showConfirm } = useDialog();

	// --- 関連する関係線の抽出 ---
	const relatedEdges = useMemo(() => {
		if (!allEdges || !allNodes || isNewNode) return [];

		return allEdges
			.filter((e) => e.source === node.id || e.target === node.id)
			.map((e) => {
				const isSource = e.source === node.id;
				const partnerId = isSource ? e.target : e.source;
				const partnerNode = allNodes.find((n) => n.id === partnerId);
				return {
					id: e.id,
					direction: isSource ? "→" : "←",
					partnerName: partnerNode?.data?.label || "不明",
					text: e.data?.text || "",
				};
			});
	}, [allEdges, allNodes, node.id, isNewNode]);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setImage(reader.result);
			reader.readAsDataURL(file);
		}
	};

	const handleSaveClick = () => {
		if (!label) return showAlert("名前を入力してください", "入力エラー");
		onSave(node.id, { label, description, details, image, tags }, "node");
		setIsEditing(false);
	};

	const handleDeleteClick = () => {
		showConfirm(
			"本当に削除しますか？\nこの操作は取り消せません。",
			() => {
				onDelete(node.id, "node");
			},
			"削除の確認"
		);
	};

	const handleCancel = () => {
		if (isNewNode) {
			onClose();
		} else {
			setIsEditing(false);
			setLabel(node.data.label || "");
			setDescription(node.data.description || "");
			setDetails(node.data.details || "");
			setImage(node.data.image || null);
			setTags(node.data.tags || []);
		}
	};

	return (
		<>
			<div className="panel-content">
				{isEditing ? (
					/* --- 編集モード --- */
					<div
						style={{ display: "flex", flexDirection: "column", gap: "15px" }}
					>
						<h3 style={{ margin: 0, fontSize: "16px" }}>
							{isNewNode ? "人物の追加" : "人物情報の編集"}
						</h3>
						<Input
							label="名前"
							value={label}
							onChange={(e) => setLabel(e.target.value)}
						/>

						<div>
							<label className="input-label">画像アイコン</label>
							<div className="flex-center" style={{ marginBottom: "5px" }}>
								{image ? (
									<img
										src={image}
										alt="current"
										className="person-node-image"
									/>
								) : (
									<NoImagePlaceholder />
								)}
								<div style={{ flex: 1 }}>
									<Input
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										containerStyle={{ marginBottom: 0 }}
									/>
								</div>
							</div>
							{image && (
								<Button
									variant="secondary"
									className="btn-sm"
									onClick={() => setImage(null)}
								>
									画像削除
								</Button>
							)}
						</div>

						<Input
							label="短い説明 (ノード表示)"
							textarea
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
						<Input
							label="詳細情報 (パネル表示)"
							textarea
							rows={6}
							value={details}
							onChange={(e) => setDetails(e.target.value)}
						/>

						<TagSelector
							availableTags={availableTags}
							selectedTags={tags}
							onTagChange={setTags}
							onCreateTag={onAddTag}
						/>
					</div>
				) : (
					/* --- 閲覧モード --- */
					<>
						<div
							className="flex-center"
							style={{
								marginBottom: "20px",
								paddingRight: "40px",
								gap: "20px",
							}}
						>
							<img
								src={image || defaultImage}
								alt="icon"
								className="person-node-image"
								style={{
									width: "80px",
									height: "80px",
									minWidth: "80px",
									objectFit: "cover",
								}}
							/>
							<div style={{ flex: 1, minWidth: 0 }}>
								<h2
									style={{
										margin: 0,
										fontSize: "22px",
										color: "var(--text-main)",
										wordBreak: "break-word",
									}}
								>
									{label}
								</h2>
								{description && (
									<div
										style={{
											color: "var(--text-sub)",
											fontSize: "14px",
											marginTop: "5px",
											wordBreak: "break-word",
										}}
									>
										{description}
									</div>
								)}
							</div>
						</div>

						<div style={{ marginBottom: "20px" }}>
							<label className="filter-label">DETAIL</label>
							<div
								style={{
									fontSize: "14px",
									lineHeight: "1.6",
									whiteSpace: "pre-wrap",
									color: "var(--text-main)",
									marginTop: "5px",
								}}
							>
								{details || (
									<span style={{ color: "#ccc" }}>詳細情報はありません</span>
								)}
							</div>
						</div>

						{/* 関係一覧表示 */}
						<div style={{ marginBottom: "20px" }}>
							<label className="filter-label">RELATIONSHIPS</label>
							{relatedEdges.length === 0 ? (
								<div
									style={{ fontSize: "13px", color: "#ccc", marginTop: "5px" }}
								>
									関係はありません
								</div>
							) : (
								<ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
									{relatedEdges.map((rel) => (
										<li
											key={rel.id}
											style={{
												fontSize: "13px",
												padding: "4px 0",
												borderBottom: "1px solid #eee",
											}}
										>
											<span
												style={{
													fontWeight: "bold",
													color: "var(--primary-color)",
												}}
											>
												{rel.direction}
											</span>
											<span style={{ margin: "0 8px", fontWeight: "bold" }}>
												{rel.partnerName}
											</span>
											<span style={{ color: "#777" }}>
												{rel.text && `(${rel.text})`}
											</span>
										</li>
									))}
								</ul>
							)}
						</div>

						<div>
							<label className="filter-label">TAGS</label>
							<div className="tag-list">
								{tags.length > 0 ? (
									tags.map((tagId) => {
										const tagObj = availableTags.find((t) => t.id === tagId);
										return tagObj ? (
											<span
												key={tagId}
												className="tag-chip"
												style={{
													background: tagObj.color.bg,
													color: tagObj.color.text,
													cursor: "default",
												}}
											>
												{tagObj.label}
											</span>
										) : null;
									})
								) : (
									<span style={{ color: "#ccc", fontSize: "13px" }}>
										タグなし
									</span>
								)}
							</div>
						</div>
					</>
				)}
			</div>

			{!readOnly && (
				<>
					{isEditing ? (
						<div className="panel-footer">
							<Button
								variant="secondary"
								onClick={handleCancel}
								style={{ width: "100%" }}
							>
								キャンセル
							</Button>
							<Button onClick={handleSaveClick} style={{ width: "100%" }}>
								保存
							</Button>
						</div>
					) : (
						<div className="panel-footer">
							<Button
								variant="danger"
								onClick={handleDeleteClick}
								style={{ width: "100%" }}
							>
								削除する
							</Button>
							<Button
								onClick={() => setIsEditing(true)}
								style={{ width: "100%" }}
							>
								編集する
							</Button>
						</div>
					)}
				</>
			)}
		</>
	);
}

// =============================================================================
// 2. 関係用パネルコンテンツ (Edge)
// =============================================================================
function EdgePanelContent({
	edge,
	onClose,
	onSave,
	onDelete,
	allNodes,
	availableTags,
	onAddTag,
	readOnly,
}) {
	const isNewEdge = edge.id.startsWith("new-");
	const [isEditing, setIsEditing] = useState(isNewEdge);

	const [source, setSource] = useState(edge.source || "");
	const [target, setTarget] = useState(edge.target || "");
	const [text, setText] = useState(edge.data?.text || "");
	const [tags, setTags] = useState(edge.data?.tags || []);

	const { showAlert, showConfirm } = useDialog();

	const handleSaveClick = () => {
		if (!source || !target) return showAlert("始点と終点を選んでください");
		if (source === target) return showAlert("自分自身には接続できません");

		const markerEnd = {
			type: MarkerType.ArrowClosed,
			color: "currentColor",
			width: 20,
			height: 20,
		};

		const saveData = {
			source,
			target,
			text,
			tags,
			markerEnd,
		};

		onSave(edge.id, saveData, "edge");
		setIsEditing(false);
	};

	const handleDeleteClick = () => {
		showConfirm(
			"この関係線を削除しますか？",
			() => {
				onDelete(edge.id, "edge");
			},
			"削除確認"
		);
	};

	const handleCancel = () => {
		if (isNewEdge) {
			onClose();
		} else {
			setIsEditing(false);
			setSource(edge.source || "");
			setTarget(edge.target || "");
			setText(edge.data?.text || "");
			setTags(edge.data?.tags || []);
		}
	};

	// 表示用の名前解決
	const sourceNode = allNodes.find((n) => n.id === source);
	const targetNode = allNodes.find((n) => n.id === target);

	return (
		<>
			<div className="panel-content">
				{isEditing ? (
					<div
						style={{ display: "flex", flexDirection: "column", gap: "15px" }}
					>
						<h3 style={{ margin: 0, fontSize: "16px" }}>
							{isNewEdge ? "関係の追加" : "関係の編集"}
						</h3>

						<div className="flex-center" style={{ alignItems: "flex-start" }}>
							<div style={{ flex: 1 }}>
								<label className="input-label">始点</label>
								<select
									className="input-field"
									value={source}
									onChange={(e) => setSource(e.target.value)}
									disabled={!isNewEdge}
									style={{ background: !isNewEdge ? "#f9f9f9" : "white" }}
								>
									<option value="">選択...</option>
									{allNodes.map((n) => (
										<option key={n.id} value={n.id}>
											{n.data.label}
										</option>
									))}
								</select>
							</div>
							<div style={{ marginTop: "25px", color: "#999" }}>
								<IconArrowRight size={24} />
							</div>
							<div style={{ flex: 1 }}>
								<label className="input-label">終点</label>
								<select
									className="input-field"
									value={target}
									onChange={(e) => setTarget(e.target.value)}
									disabled={!isNewEdge}
									style={{ background: !isNewEdge ? "#f9f9f9" : "white" }}
								>
									<option value="">選択...</option>
									{allNodes.map((n) => (
										<option key={n.id} value={n.id}>
											{n.data.label}
										</option>
									))}
								</select>
							</div>
						</div>

						{!isNewEdge && (
							<p style={{ fontSize: "10px", color: "#999", margin: 0 }}>
								※ 接続先を変更したい場合は、一度削除して作り直してください。
							</p>
						)}

						<Input
							label="関係の説明 (線の上に表示)"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="例: 親友, ライバル"
						/>
						<TagSelector
							availableTags={availableTags}
							selectedTags={tags}
							onTagChange={setTags}
							onCreateTag={onAddTag}
						/>
					</div>
				) : (
					/* 閲覧モード */
					<div
						style={{ display: "flex", flexDirection: "column", gap: "20px" }}
					>
						<h3 style={{ margin: 0, fontSize: "16px" }}>関係の詳細</h3>

						{/* ★修正: 画像を追加しレイアウト調整 */}
						<div
							className="flex-center"
							style={{
								justifyContent: "space-between",
								padding: "15px 10px",
								background: "#f9f9f9",
								borderRadius: "8px",
								alignItems: "center",
							}}
						>
							<div
								style={{
									textAlign: "center",
									flex: 1,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: "5px",
								}}
							>
								<div style={{ fontSize: "11px", color: "#777" }}>始点</div>
								<div style={{ fontWeight: "bold" }}>
									{sourceNode?.data.label || "不明"}
								</div>
								{/* 始点画像 */}
								<img
									src={sourceNode?.data.image || defaultImage}
									alt="source"
									className="person-node-image" // 既存CSSクラスを流用
									style={{ marginBottom: 0 }} // 微調整
								/>
							</div>

							<div style={{ color: "var(--primary-color)" }}>
								<IconArrowRight size={32} />
							</div>

							<div
								style={{
									textAlign: "center",
									flex: 1,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: "5px",
								}}
							>
								<div style={{ fontSize: "11px", color: "#777" }}>終点</div>
								<div style={{ fontWeight: "bold" }}>
									{targetNode?.data.label || "不明"}
								</div>
								{/* 終点画像 */}
								<img
									src={targetNode?.data.image || defaultImage}
									alt="target"
									className="person-node-image"
									style={{ marginBottom: 0 }}
								/>
							</div>
						</div>

						<div>
							<label className="filter-label">LABEL</label>
							<div
								style={{
									fontSize: "16px",
									fontWeight: "bold",
									marginTop: "5px",
								}}
							>
								{text || (
									<span style={{ color: "#ccc", fontSize: "13px" }}>
										ラベルなし
									</span>
								)}
							</div>
						</div>

						<div>
							<label className="filter-label">TAGS</label>
							<div className="tag-list">
								{tags.length > 0 ? (
									tags.map((tagId) => {
										const tagObj = availableTags.find((t) => t.id === tagId);
										return tagObj ? (
											<span
												key={tagId}
												className="tag-chip"
												style={{
													background: tagObj.color.bg,
													color: tagObj.color.text,
												}}
											>
												{tagObj.label}
											</span>
										) : null;
									})
								) : (
									<span style={{ color: "#ccc", fontSize: "13px" }}>
										タグなし
									</span>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{!readOnly && (
				<>
					{isEditing ? (
						<div className="panel-footer">
							<Button
								variant="secondary"
								onClick={handleCancel}
								style={{ width: "100%" }}
							>
								キャンセル
							</Button>
							<Button onClick={handleSaveClick} style={{ width: "100%" }}>
								保存
							</Button>
						</div>
					) : (
						<div className="panel-footer">
							<Button
								variant="danger"
								onClick={handleDeleteClick}
								style={{ width: "100%" }}
							>
								削除する
							</Button>
							<Button
								onClick={() => setIsEditing(true)}
								style={{ width: "100%" }}
							>
								編集する
							</Button>
						</div>
					)}
				</>
			)}
		</>
	);
}

// ... (SidePanelラッパーはそのまま)
export default function SidePanel({
	isOpen,
	selection,
	onClose,
	allNodes,
	allEdges,
	...props
}) {
	const containerClass = `side-panel ${isOpen ? "open" : ""}`;
	const contentKey = selection?.data?.id || "empty";

	const isNode = selection?.type === "node";
	const isEdge = selection?.type === "edge";

	return (
		<div className="side-panel-overlay">
			<div className={containerClass}>
				<div
					style={{
						position: "absolute",
						top: "15px",
						right: "15px",
						zIndex: 10,
					}}
				>
					<Button
						variant="secondary"
						onClick={onClose}
						style={{
							minWidth: "36px",
							width: "36px",
							height: "36px",
							padding: 0,
							borderRadius: "50%",
						}}
					>
						<IconX size={20} />
					</Button>
				</div>

				{isNode && (
					<PersonPanelContent
						key={contentKey}
						node={selection.data}
						onClose={onClose}
						allEdges={allEdges}
						allNodes={allNodes}
						{...props}
					/>
				)}

				{isEdge && (
					<EdgePanelContent
						key={contentKey}
						edge={selection.data}
						onClose={onClose}
						allNodes={allNodes}
						{...props}
					/>
				)}

				{!selection && (
					<div style={{ padding: "20px", color: "#999" }}>
						選択されていません
					</div>
				)}
			</div>
		</div>
	);
}
