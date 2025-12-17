/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export const DialogProvider = ({ children }) => {
	const [dialogConfig, setDialogConfig] = useState({
		isOpen: false,
		title: "",
		message: "",
		type: "alert", // 'alert' | 'confirm'
		onConfirm: null,
	});

	// アラート表示 (OKボタンのみ)
	const showAlert = useCallback((message, title = "お知らせ") => {
		setDialogConfig({
			isOpen: true,
			title,
			message,
			type: "alert",
			onConfirm: null,
		});
	}, []);

	// 確認ダイアログ表示 (OK / キャンセル)
	// 実行する関数(onConfirmAction)を引数で受け取る
	const showConfirm = useCallback(
		(message, onConfirmAction, title = "確認") => {
			setDialogConfig({
				isOpen: true,
				title,
				message,
				type: "confirm",
				onConfirm: onConfirmAction,
			});
		},
		[]
	);

	const closeDialog = useCallback(() => {
		setDialogConfig((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const handleConfirm = useCallback(() => {
		if (dialogConfig.onConfirm) {
			dialogConfig.onConfirm();
		}
		closeDialog();
	}, [dialogConfig, closeDialog]);

	return (
		<DialogContext.Provider value={{ showAlert, showConfirm }}>
			{children}

			{/* グローバルダイアログのレンダリング */}
			<Modal
				isOpen={dialogConfig.isOpen}
				onClose={closeDialog}
				title={dialogConfig.title}
				footer={
					<>
						{dialogConfig.type === "confirm" && (
							<Button variant="secondary" onClick={closeDialog}>
								キャンセル
							</Button>
						)}
						<Button
							variant={dialogConfig.type === "confirm" ? "danger" : "primary"}
							onClick={handleConfirm}
						>
							OK
						</Button>
					</>
				}
			>
				<p
					style={{
						margin: 0,
						fontSize: "14px",
						lineHeight: "1.5",
						whiteSpace: "pre-wrap",
					}}
				>
					{dialogConfig.message}
				</p>
			</Modal>
		</DialogContext.Provider>
	);
};
