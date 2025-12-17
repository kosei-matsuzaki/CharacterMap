/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";
import LoadingOverlay from "../components/ui/LoadingOverlay";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
	const [loadingState, setLoadingState] = useState({
		isVisible: false,
		message: "",
	});

	const showLoading = useCallback((message = "Loading...") => {
		setLoadingState({ isVisible: true, message });
	}, []);

	const hideLoading = useCallback(() => {
		setLoadingState((prev) => ({ ...prev, isVisible: false }));
	}, []);

	return (
		<LoadingContext.Provider value={{ showLoading, hideLoading }}>
			{children}
			<LoadingOverlay
				isVisible={loadingState.isVisible}
				message={loadingState.message}
			/>
		</LoadingContext.Provider>
	);
};
