import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { requestsApi } from "../../lib/axios";
import { useBooks } from "../../context/BooksContext";
import { useNotifications } from "../../context/NotificationsContext";
import { useDebounce } from "../../hooks/useDebounce";
import { useAdminList } from "../../hooks/useAdminList";
import { useApiError } from "../../hooks/useApiError";
import Loader from "../Loader";
import RateLimited from "../RateLimited";
import BooksNotFound from "../BooksNotFound";
import RequestCard from "./RequestCard";
import DenyModal from "./DenyModal";

const RequestsTab = ({ type, search }) => {
    const debouncedSearch = useDebounce(search, 400);
    const { items, loading, failed, isRateLimited, reload, setItems } = useAdminList(
        requestsApi,
        { type, search: debouncedSearch.trim() }
    );

    const { refreshBooks } = useBooks();
    const { subscribe } = useNotifications();
    const handleApiError = useApiError();

    const [busyId, setBusyId] = useState(null);
    const [denying, setDenying] = useState(null);


    useEffect(() => subscribe((notification) => {
        if (notification.type === "new_request" && notification.requestType === type) reload();
    }), [subscribe, type, reload]);

    const removeRow = (requestId) => {
        setItems((prev) => prev.filter((r) => r._id !== requestId));
    };

    const approve = async (request) => {
        if (busyId) return;

        setBusyId(request._id);
        try {
            await requestsApi.patch(`/${request._id}/approve`);
            toast.success(type === "borrow" ? "Borrow request approved" : "Return approved");
            removeRow(request._id);
            refreshBooks(true);
        } catch (error) {
            const status = handleApiError(error, "Could not approve the request");
            if (status === 404 || status === 409) reload();   // the list was out of date
        } finally {
            setBusyId(null);
        }
    };

    const deny = async (reason) => {
        const request = denying;
        if (!request || busyId) return;

        setBusyId(request._id);
        try {
            await requestsApi.patch(`/${request._id}/deny`, reason ? { reason } : {});
            toast.success("Request denied");
            removeRow(request._id);
            setDenying(null);
        } catch (error) {
            const status = handleApiError(error, "Could not deny the request");
            if (status === 404 || status === 409) {
                setDenying(null);
                reload();
            }
        } finally {
            setBusyId(null);
        }
    };

    if (isRateLimited) return <RateLimited />;
    if (loading && items.length === 0) return <Loader />;

    if (failed && items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="opacity-70">We could not load the requests.</p>
                <button className="btn btn-primary btn-sm" onClick={reload}>Try again</button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <BooksNotFound
                title={search.trim() ? "No matching requests" : `No pending ${type} requests`}
                message={search.trim() ? "Try a different username or email." : "New requests will show up here as soon as they arrive."}
            />
        );
    }

    return (
        <>
            <div className={`flex flex-col gap-3 transition-opacity ${loading ? "opacity-60" : ""}`}>
                {items.map((request) => (
                    <RequestCard
                        key={request._id}
                        request={request}
                        busy={busyId === request._id}
                        onApprove={() => approve(request)}
                        onDeny={() => setDenying(request)}
                    />
                ))}
            </div>

            {items.length >= 50 && (
                <p className="text-center text-xs opacity-60">Showing the 50 oldest requests.</p>
            )}

            {denying && (
                <DenyModal
                    request={denying}
                    submitting={busyId === denying._id}
                    onSubmit={deny}
                    onClose={() => setDenying(null)}
                />
            )}
        </>
    );
};

export default RequestsTab;