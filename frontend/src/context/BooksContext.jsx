import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { booksApi } from '../lib/axios';
import { useAuth } from './AuthContext';

const BooksContext = createContext(null);

const CACHE_KEY = "catalog_cache";
const CACHE_TTL = 300_000; // 300 seconds

const readCache = () => {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const {books, fetchedAt} = JSON.parse(raw);
        return Array.isArray(books) ? {books, fetchedAt} : null;
    } catch (error) {
        return null
    }
}

const writeCache = (books, fetchedAt) => {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({books, fetchedAt}));
    } catch (error) {
        // storage full or blocked condition
    }
}

export const BooksProvider = ({children}) => {
    const { isLogged } = useAuth();

    // initial loading
    const [initial] = useState(readCache);
    const [books, setBooks] = useState(initial?.books ?? []);
    const [loading, setLoading] = useState(!initial);
    const [isRateLimited, setIsRateLimited] = useState(false);

    const fetchedAt = useRef(initial?.fetchedAt ?? 0);
    const inFlight = useRef(null);
    const prevLogged = useRef(null);
    const mutations = useRef(0);

    const refreshBooks = useCallback((force = false) => {
        // if already fetching
        if (inFlight.current) return inFlight.current;
        if (!force && Date.now() - fetchedAt.current < CACHE_TTL) return Promise.resolve();

        const mutationsAtStart = mutations.current;

        inFlight.current = (async () => {
            try {
                const res = await booksApi.get("/");
                if (mutations.current === mutationsAtStart) {
                    fetchedAt.current = Date.now();
                    setBooks(res.data);
                }
                setIsRateLimited(false);
            } catch (error) {
                console.log("Error while fetching catalog", error);
                if (error.response?.status === 429) {
                    setIsRateLimited(true);
                } else {
                    toast.error("Failed to load books");
                }
            } finally {
                setLoading(false);
                inFlight.current = null;
            }
        })();

        return inFlight.current;
    }, [])

    // used to update cache when books changed
    useEffect(() => {
        if (!fetchedAt.current) return;
        writeCache(books, fetchedAt.current);
    } , [books]);

    // fetch on start if no cache or older than 300s
    useEffect(() => {
        refreshBooks();
    }, [refreshBooks]);

    // use when tab is re focuses and cache is stale and old. (eg. update on another device)
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") refreshBooks();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [refreshBooks])

    // on login logout etc.
    useEffect(() => {
        if(isLogged === null) return;
        if (prevLogged.current !== null && prevLogged.current !== isLogged) {
            refreshBooks(true);
        }
        prevLogged.current = isLogged;
    }, [isLogged, refreshBooks]);

    // local update after borrow or return (no request needed since it is already handled)
    const markBorrowed = useCallback((bookId, userId) => {
        mutations.current += 1;
        setBooks((prev) => prev.map((b) => {
            if (b._id !== bookId || b.reservedBy?.includes(userId)) return b;
            return {...b, stock: b.stock - 1, reservedBy: [...(b.reservedBy ?? []), userId]};
        }));
    }, []);

    const markReturned = useCallback((bookId, userId) => {
        mutations.current += 1;
        setBooks((prev) => prev.map((b) => {
            if(b._id !== bookId || !b.reservedBy?.includes(userId)) return b;
            return {...b, stock: b.stock + 1, reservedBy: b.reservedBy.filter((id) => id !== userId)};
        }));
    }, []);

    return (
        <BooksContext.Provider value={{books, loading, isRateLimited, refreshBooks, markBorrowed, markReturned}} >
            {children}
        </BooksContext.Provider>
    );
};

export const useBooks = () => useContext(BooksContext);