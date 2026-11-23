import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export const useAdminList = (api, params) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);

    const latest = useRef(0);
    const paramsKey = JSON.stringify(params);   // a stable "fingerprint" of the parameters

    const load = useCallback(async () => {
        const mine = ++latest.current;
        setLoading(true);

        try {
            const res = await api.get("/", { params: JSON.parse(paramsKey) });
            if (mine !== latest.current) return;   // a newer search was started, ignore this old answer

            setItems(res.data);
            setFailed(false);
            setIsRateLimited(false);
        } catch (error) {
            if (mine !== latest.current) return;

            console.log("Error while loading list", error);
            if (error.response?.status === 429) {
                setIsRateLimited(true);
            } else {
                setFailed(true);
                toast.error("Failed to load the list");
            }
        } finally {
            if (mine === latest.current) setLoading(false);
        }
    }, [api, paramsKey]);

    useEffect(() => {
        load();
    }, [load]);

    return { items, loading, failed, isRateLimited, reload: load, setItems };
};