import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";

import { DialogProvider } from "./contexts/DialogContext";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import Viewer from "./pages/Viewer";
// ★追加
import { LoadingProvider } from "./contexts/LoadingContext";

export default function App() {
	return (
		<ReactFlowProvider>
			<DialogProvider>
				{/* ★追加: LoadingProviderでラップ */}
				<LoadingProvider>
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/editor/:id" element={<Editor />} />
							<Route path="/viewer/:id" element={<Viewer />} />
						</Routes>
					</BrowserRouter>
				</LoadingProvider>
			</DialogProvider>
		</ReactFlowProvider>
	);
}
