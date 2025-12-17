import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDialog } from "../contexts/DialogContext";
import { DiagramRepository } from "../services/DiagramRepository";

export default function Home() {
	const navigate = useNavigate();
	const { showConfirm } = useDialog();

	const [diagrams, setDiagrams] = useState(() => {
		const allData = DiagramRepository.getAll();
		return Object.values(allData).sort(
			(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
		);
	});

	const handleCreateNew = () => {
		const newId = crypto.randomUUID();
		navigate(`/editor/${newId}`);
	};

	const handleDelete = (id, e) => {
		e.stopPropagation();
		showConfirm(
			"本当に削除しますか？\nこの操作は元に戻せません。",
			() => {
				DiagramRepository.delete(id);
				const allData = DiagramRepository.getAll();
				const newList = Object.values(allData).sort(
					(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
				);
				setDiagrams(newList);
			},
			"削除確認"
		);
	};

	return (
		<div className="home-container">
			<h1 className="home-title">相関図一覧</h1>

			<button
				onClick={handleCreateNew}
				className="btn btn-primary"
				style={{ marginBottom: "20px", fontSize: "16px" }}
			>
				+ 新規作成
			</button>

			<table className="home-table">
				<thead>
					<tr>
						<th style={{ width: "50%" }}>タイトル</th>
						<th>更新日時</th>
						<th style={{ width: "100px" }}>操作</th>
					</tr>
				</thead>
				<tbody>
					{diagrams.length === 0 ? (
						<tr>
							<td colSpan="3" className="home-empty">
								まだ相関図がありません
							</td>
						</tr>
					) : (
						diagrams.map((d) => (
							<tr
								key={d.id}
								onClick={() => navigate(`/viewer/${d.id}`)}
								className="home-row"
							>
								<td>{d.name || "名称未設定"}</td>
								<td>{d.updatedAt}</td>
								<td style={{ textAlign: "center" }}>
									<button
										className="btn btn-danger"
										style={{
											minWidth: "60px",
											padding: "4px 8px",
											fontSize: "12px",
										}}
										onClick={(e) => handleDelete(d.id, e)}
									>
										削除
									</button>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}
