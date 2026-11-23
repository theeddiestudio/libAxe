import { createContext, useState, useContext, useCallback, useEffect, useMemo } from "react";
import { requestsApi } from "../lib/axios.js";
import { useAuth } from "./AuthContext.jsx";
import { requestBookId } from "../lib/utils.js";

const RequestsContext = createContext(null);

const EMPTY = [];

export const RequestsProvider = ({children}) => {
    const {isLogged, isAdmin, user} = useAuth();
    const userId = isLogged === true && !isAdmin ? (user?._id ?? null) : null;

    // one slot per user
    const [store, setStore] = useState({});
    const requests = (userId && store[userId]) || EMPTY;

    const refreshRequests = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await requestsApi.get("/me", {params: {status: "pending"}});
            setStore((prev) => ({...prev, [userId]: res.data}));
        } catch (error) {
            console.log("Error while fetching requests", error);
        }
    }, [userId]);

    useEffect(() => {
        refreshRequests
    }, [refreshRequests]);

    const pendingBorrow = useMemo(() => {
        const map = new Map();
        for(const r of requests) {
            if (r.type === 'borrow' && r.status === 'pending') map.set(requestBookId(r), r);
        }
        return map;
    }, [requests]);

    const pendingReturn = useMemo(() => {
        const map = new Map();
        for(const r of requests) {
            if (r.type === 'return' && r.status === 'pending') map.set(requestBookId(r), r);
        }
        return map;
    }, [requests]);

    const addRequest = useCallback((request) => {
        if (!userId) return;
        setStore((prev) => ({...prev, [userId]: [request, ...(prev[userId] ?? EMPTY)]}));
    }, [userId]);

    const removeRequest = useCallback((requestId) => {
        if (!userId) return;
        setStore((prev) => ({...prev, [userId]: (prev[userId] ?? EMPTY).filter(r => r._id !== requestId)}));
    }, [userId]);

    return (
        <RequestsContext.Provider value={{pendingBorrow, pendingReturn, refreshRequests, addRequest, removeRequest}}>
            {children}
        </RequestsContext.Provider>
    )
}

export const useRequests = () => useContext(RequestsContext);