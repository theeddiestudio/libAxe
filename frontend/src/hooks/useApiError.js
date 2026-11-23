import { useCallback } from "react";
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { getErrorMessage } from "../lib/utils.js";

export const useApiError = () => {
    const navigate = useNavigate();
    const {clearAuth} = useAuth();

    return useCallback((error, fallback) => {
        const status = error.response?.status;

        if(status === 429) {
            toast.error("Too many requests", { duration: 4000, icon: "💀" });
        } else if (status === 401) {
            clearAuth();
            toast.error("Session expired, please login again.");
            navigate("/login");
        } else if (!error.response) {
            toast.error("Cannot reach the server");
        } else {
            toast.error(getErrorMessage(error, fallback));
        }

        return status;
    }, [navigate, clearAuth])
};