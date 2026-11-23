import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { notificationsApi, STREAM_URL } from "../lib/axios";
import { useAuth } from "./AuthContext";
import { useBooks } from "./BooksContext";
import { useRequests } from "./RequestsContext";
import { useLoans } from "./LoansContext";

const NotificationsContext = createContext(null);

const EMPTY = { items: [], unreadCount: 0, loaded: false };
const MAX_ITEMS = 50;

const showToast = (notification) => {
    const options = { duration: 6000 };

    if (notification.type === "approved") {
        toast.success(notification.message, options);
    } else if (notification.type === "denied") {
        toast(notification.message, { ...options, icon: "❌" });
    } else {
        toast(notification.message, { ...options, icon: "📬" });
    }
};

export const NotificationsProvider = ({ children }) => {
    const { isLogged, user } = useAuth();
    const { refreshBooks } = useBooks();
    const { refreshRequests } = useRequests();
    const { refreshLoans } = useLoans();

    const userId = isLogged === true ? (user?._id ?? null) : null;

    // one slot per person
    const [store, setStore] = useState({});
    const mine = (userId && store[userId]) || EMPTY;

    const knownIds = useRef(new Set()); // seen notifications
    const listeners = useRef(new Set());

    useEffect(() => {
        if (!userId) return;

        knownIds.current = new Set();
        let closed = false;

        const load = async (announce) => {
            try {
                const res = await notificationsApi.get("/");
                if (closed) return;

                const { notifications, unreadCount } = res.data;
                const fresh = notifications.filter((n) => !n.read && !knownIds.current.has(n._id));
                notifications.forEach((n) => knownIds.current.add(n._id));

                setStore((prev) => ({ ...prev, [userId]: { items: notifications, unreadCount, loaded: true } }));

                if (announce && fresh.length > 0) {
                    toast(`You have ${fresh.length} new ${fresh.length === 1 ? "notification" : "notifications"}`, { icon: "🔔" });
                    refreshBooks(true);
                    refreshRequests();
                    refreshLoans();
                }
            } catch (error) {
                console.log("Error while fetching notifications", error);
            }
        };

        const handleIncoming = (notification) => {
            if (closed || knownIds.current.has(notification._id)) return;
            knownIds.current.add(notification._id);

            setStore((prev) => {
                const slot = prev[userId] ?? EMPTY;
                return {
                    ...prev,
                    [userId]: {
                        loaded: true,
                        items: [notification, ...slot.items].slice(0, MAX_ITEMS),
                        unreadCount: slot.unreadCount + 1
                    }
                };
            });

            showToast(notification);

            if (notification.type === "approved") {
                refreshBooks(true);
                refreshRequests();
                refreshLoans();
            } else if (notification.type === "denied") {
                refreshRequests();
            }

            listeners.current.forEach((listener) => listener(notification));
        };

        load(false);

        const source = new EventSource(STREAM_URL, { withCredentials: true });
        let opened = false;

        source.addEventListener("ready", () => {
            if (opened) load(true); // reconnect
            opened = true;
        });

        source.addEventListener("notification", (event) => {
            try {
                handleIncoming(JSON.parse(event.data));
            } catch (error) {
                console.log("Bad notification message", error);
            }
        });

        source.onerror = () => {
            if (source.readyState === EventSource.CLOSED) console.log("Notification stream closed");
        };

        return () => {
            closed = true;
            source.close();
        };
    }, [userId, refreshBooks, refreshRequests, refreshLoans]);

    const markAllRead = useCallback(async () => {
        if (!userId) return;

        setStore((prev) => {
            const slot = prev[userId];
            if (!slot) return prev;
            return {
                ...prev,
                [userId]: { ...slot, unreadCount: 0, items: slot.items.map((n) => ({ ...n, read: true })) }
            };
        });

        try {
            await notificationsApi.patch("/read", {});
        } catch (error) {
            console.log("Error while marking notifications as read", error);
            toast.error("Could not mark notifications as read");
        }
    }, [userId]);

    const markOneRead = async (notificationId) => {
        const target = mine.items.find((n) => n._id === notificationId);
        if (!userId || !target || target.read) return;

        setStore((prev) => {
            const slot = prev[userId];
            if (!slot) return prev;
            return {
                ...prev,
                [userId]: {
                    ...slot,
                    unreadCount: Math.max(0, slot.unreadCount - 1),
                    items: slot.items.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
                }
            };
        });

        try {
            await notificationsApi.patch("/read", { ids: [notificationId] });
        } catch (error) {
            console.log("Error while marking notification as read", error);
        }
    };

    const subscribe = useCallback((listener) => {
        listeners.current.add(listener);
        return () => {
            listeners.current.delete(listener);
        };
    }, []);

    return (
        <NotificationsContext.Provider value={{
            notifications: mine.items,
            unreadCount: mine.unreadCount,
            loaded: mine.loaded,
            markAllRead,
            markOneRead,
            subscribe
        }}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationsContext);