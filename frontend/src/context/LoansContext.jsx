import { createContext, useContext, useState, useCallback, useRef } from "react";
import { userApi } from "../lib/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const LoansContext = createContext(null);

const NOTHING = {
    data: null,
    failed: false,
    isRateLimited: false
}

export const LoansProvider = ({children}) => {
    const {isLogged, isAdmin, user} = useAuth();

    const userId = isLogged === true && !isAdmin ? (user?._id ?? null) : null;

    // one slot per person
    const [store, setStore] = useState([]);
    const inFlight = useRef(null);

    const mine = (userId && store[userId]) || NOTHING;

    const refreshLoans = useCallback(() => {
        if (!userId) return Promise.resolve();
        if (inFlight.current?.userId === userId) return inFlight.current.promise;
        
        const entry = {userId, promise: null};
        inFlight.current = entry;

        entry.promise = (async () => {
            try {
                const res = await userApi.get("/loans");
                setStore((prev) => ({...prev, [userId]: {
                    data: res.data,
                    failed: false,
                    isRateLimited: false
                }}));
            } catch (error) {
                console.log("Error while fetching loans", error);
                const isRateLimited = error.response?.status === 429;

                setStore((prev) => ({...prev, [userId]: {
                    data: prev[userId]?.data ?? null,
                    failed: !isRateLimited,
                    isRateLimited
                }}));
                if (!isRateLimited) toast.error("Failed to load your loans");
            } finally {
                if (inFlight.current === entry) inFlight.current = null;
            }
        })();

        return entry.promise;
    }, [userId]);

    return (
        <LoansContext.Provider value={{
            loaded: mine.data !== null,
            active: mine.data?.active ?? [],
            unpaid: mine.data?.unpaid ?? [],
            totalAccruing: mine.data?.totalAccruing ?? 0,
            totalUnpaid: mine.data?.totalUnpaid ?? 0,
            failed: mine.failed,
            isRateLimited: mine.isRateLimited,
            refreshLoans
        }}>
            {children}
        </LoansContext.Provider>
    )
}

export const useLoans = () => useContext(LoansContext);