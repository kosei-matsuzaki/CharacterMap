import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import Viewer from "./pages/Viewer"; // ★追加

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* ホーム画面 */}
				<Route path="/" element={<Home />} />

				{/* 閲覧画面（ここもProviderで包むと安心） */}
				<Route
					path="/viewer/:id"
					element={
						<ReactFlowProvider>
							<Viewer />
						</ReactFlowProvider>
					}
				/>

				{/* 編集画面 */}
				<Route
					path="/editor/:id"
					element={
						<ReactFlowProvider>
							<Editor />
						</ReactFlowProvider>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
