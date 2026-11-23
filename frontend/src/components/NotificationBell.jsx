import { useNavigate } from "react-router";
import { BellIcon, CheckCheckIcon, CircleCheckIcon, InboxIcon, XIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import { formatDate, notificationLink, timeAgo } from "../lib/utils";

const TypeIcon = ({ type }) => {
    if (type === "approved") {
        return (
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                <CircleCheckIcon className="size-4" />
            </span>
        );
    }

    if (type === "denied") {
        return (
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-error/15 text-error">
                <XIcon className="size-4" />
            </span>
        );
    }

    return (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <InboxIcon className="size-4" />
        </span>
    );
};

const NotificationBell = () => {
    const {isAdmin} = useAuth();
    const {notifications, unreadCount, loaded, markAllRead, markOneRead} = useNotifications()
    const navigate = useNavigate();

    const handleOpen = (notification) => {
        markOneRead(notification._id);
        document.activeElement?.blur();

        const link = notificationLink(notification, isAdmin);
        if (link) navigate(link);
    }

    return (
        <div className="dropdown dropdown-end">
            <div className="btn btn-ghost btn-circle" aria-label="Notiifications" role="button" tabIndex={0}>
                <div className="indicator">
                    <BellIcon className="size-5" />
                    {unreadCount > 0 && (
                        <span className="indicator-item badge-primary badge badge-xs">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>
            </div>

            <div tabIndex={0} className="dropdown-content fixed inset-x-3 top-16 z-40 mt-2 w-auto rounded-box bg-base-100 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80">
                <div className="flex items-center justify-between border-b border-base-content/10 px-4 py-3">
                    <h3 className="font-semibold">Notifications</h3>
                    <button className="btn btn-xs btn-ghost" onClick={markAllRead}>
                        <CheckCheckIcon className="size-3.5" />
                        Mark all read
                    </button>
                </div>

                {!loaded && (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-sm"></span>
                    </div>
                )}

                {loaded && notifications.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm opacity-60">
                        No notifications yet
                    </div>
                )}

                {loaded && notifications.length > 0 && (
                    <ul className="divide-y divide-base-content/10 overflow-y-auto max-h-[60vh] sm:max-h-96">
                        {notifications.map(n => (
                            <li key={n._id}>
                                <button
                                    onClick={() => handleOpen(n)}
                                    className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-base-200 ${n.read ? "" : "bg-primary/5"}`}
                                >
                                    <TypeIcon type={n.type} />
                                    <span className="flex-1 min-w-0">
                                        <span className={`block wrap-break-word text-sm ${n.read ? "opacity-70" : "font-medium"}`} >
                                            {n.message}
                                        </span>
                                        <span className="block text-xs opacity-50 mt-0.5" title={formatDate(n.createdAt)} >
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </span>
                                    {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary"></span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

            </div>
        </div>
    )
};

export default NotificationBell;