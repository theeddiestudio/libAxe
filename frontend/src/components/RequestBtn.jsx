import { useState } from "react";
import { useNavigate } from "react-router";
import { BookmarkPlusIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { requestsApi } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useBooks } from "../context/BooksContext";
import { useRequests } from "../context/RequestsContext";
import { useApiError } from "../hooks/useApiError";
import RequestModal from "./RequestModal";

const RequestBtn = ({book, className = "flex-1"}) => {
    const {isLogged} = useAuth();
    const {refreshBooks} = useBooks();
    const {pendingBorrow, addRequest, removeRequest, refreshRequests} = useRequests();

    const handleApiError = useApiError();
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const pending = pendingBorrow.get(book._id);
    const outOfStock = book.stock <= 0;

    const sendRequest = async (days) => {
        if (busy) return;
        setBusy(true);

        try {
            const res = await requestsApi.post("/", {bookId: book._id, type:"borrow", days});
            addRequest(res.data);
            setModalOpen(false);
            toast.success("Request sent");
        } catch (error) {
            const status = handleApiError(error, "Could not send request");

            if (status === 403 || status === 404 || status === 409) {
                setModalOpen(false);
                refreshRequests();
                refreshBooks(true);
            }
        } finally {
            setBusy(false);
        }
    }

    const cancelRequest = async () => {
        if (busy) return;
        if (!window.confirm(`Cancel your request for "${book.title}"?`)) return;
        setBusy(true);

        try {
            await requestsApi.delete(`/${pending._id}`);
            removeRequest(pending._id);
            toast.success("Request cancelled");
        } catch (error) {
            const status = handleApiError(error, "Could not send request");

            if (status === 404) refreshRequests();
        } finally {
            setBusy(false);
        }
    }

    const handleClick = () => {
        if (!isLogged) {
            toast("Please login to request books", { icon: "🔒" });
            navigate("/login");
            return;
        }

        if (pending) {
            cancelRequest();
        } else {
            setModalOpen(true);
        }
    }

    const label = pending ? "Cancel request" : outOfStock ? "Out of stock" : "Request";
    const Icon = pending ? XIcon : BookmarkPlusIcon;

    return (
        <>
            <button
                className={`btn ${pending ? "btn-outline" : "btn-primary"} ${className}`}
                onClick={handleClick}
                disabled={busy || (!pending && outOfStock)}
            >
                {busy
                    ? <span className="loading loading-spinner loading-sm"></span>
                    : <Icon className="size-4" />
                }
                <span>{label}</span>
            </button>

            {modalOpen && (
                <RequestModal
                    book={book}
                    submitting={busy}
                    onSubmit={sendRequest}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    )
}

export default RequestBtn;