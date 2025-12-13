import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
	const navigate = useNavigate();

	// 【修正ポイント】
	// useEffectを使わず、useStateの初期化時に関数を使ってデータを読み込みます。
	// これにより "Calling setState synchronously within an effect" エラーが解消されます。
	const [diagrams, setDiagrams] = useState(() => {
		try {
			const savedData = JSON.parse(localStorage.getItem("my-diagrams") || "{}");
			// オブジェクトを配列に変換して更新日順に並べる
			return Object.values(savedData).sort(
				(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
			);
		} catch (error) {
			console.error("Failed to load diagrams:", error);
			return [];
		}
	});

	// 新規作成処理
	const handleCreateNew = () => {
		const newId = crypto.randomUUID();
		navigate(`/editor/${newId}`);
	};

	// 削除処理
	const handleDelete = (id, e) => {
		e.stopPropagation(); // 行クリックイベントを止める
		if (window.confirm("本当に削除しますか？")) {
			const savedData = JSON.parse(localStorage.getItem("my-diagrams") || "{}");
			delete savedData[id];
			localStorage.setItem("my-diagrams", JSON.stringify(savedData));

			// 削除後のデータを再計算してStateを更新
			const newList = Object.values(savedData).sort(
				(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
			);
			setDiagrams(newList);
		}
	};

	return (
		<div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
			<h1>相関図一覧</h1>
			<button
				onClick={handleCreateNew}
				style={{
					marginBottom: "20px",
					padding: "10px 20px",
					fontSize: "16px",
					cursor: "pointer",
				}}
			>
				+ 新規作成
			</button>

			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr style={{ background: "#eee", textAlign: "left" }}>
						<th style={{ padding: "10px", border: "1px solid #ccc" }}>
							タイトル
						</th>
						<th style={{ padding: "10px", border: "1px solid #ccc" }}>
							更新日時
						</th>
						<th style={{ padding: "10px", border: "1px solid #ccc" }}>操作</th>
					</tr>
				</thead>
				<tbody>
					{diagrams.length === 0 ? (
						<tr>
							<td colSpan="3" style={{ padding: "20px", textAlign: "center" }}>
								まだ相関図がありません
							</td>
						</tr>
					) : (
						diagrams.map((d) => (
							<tr
								key={d.id}
								onClick={() => navigate(`/viewer/${d.id}`)}
								style={{ cursor: "pointer", borderBottom: "1px solid #ccc" }}
								onMouseOver={(e) =>
									(e.currentTarget.style.background = "#f9f9f9")
								}
								onMouseOut={(e) => (e.currentTarget.style.background = "white")}
							>
								<td style={{ padding: "10px" }}>{d.name || "名称未設定"}</td>
								<td style={{ padding: "10px" }}>{d.updatedAt}</td>
								<td style={{ padding: "10px" }}>
									<button onClick={(e) => handleDelete(d.id, e)}>削除</button>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}
