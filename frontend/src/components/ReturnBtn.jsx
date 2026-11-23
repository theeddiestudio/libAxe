import { useState } from 'react'
import toast from 'react-hot-toast'
import { Undo2Icon, XIcon } from 'lucide-react'
import { requestsApi } from '../lib/axios'
import { useRequests } from '../context/RequestsContext'
import { useLoans } from '../context/LoansContext'
import { useApiError } from '../hooks/useApiError'

const ReturnBtn = ({ loan, className = "btn btn-outline btn-sm" }) => {
    const { pendingReturn, addRequest, removeRequest, refreshRequests } = useRequests();
    const { refreshLoans } = useLoans();
    const handleApiError = useApiError();

    const [busy, setBusy] = useState(false);

    const bookId = loan.book?._id;
    const title = loan.book?.title ?? "this book";
    const pending = bookId ? pendingReturn.get(bookId) : undefined;

    const sendReturn = async () => {
        if (busy || !bookId) return;
        if (!window.confirm(`Request to return "${title}"?`)) return;

        setBusy(true);
        try {
            const res = await requestsApi.post("/", { bookId, type: "return" });
            addRequest(res.data);
            toast.success("Return requested.");
        } catch (error) {
            const status = handleApiError(error, "Could not send return request");

            if (status === 400 || status === 409) {
                refreshRequests();
                refreshLoans();
            }
        } finally {
            setBusy(false);
        }
    };

    const cancelReturn = async () => {
        if (busy) return;
        if (!window.confirm(`Cancel your return request for "${title}"?`)) return;

        setBusy(true);
        try {
            await requestsApi.delete(`/${pending._id}`);
            removeRequest(pending._id);
            toast.success("Return request cancelled");
        } catch (error) {
            const status = handleApiError(error, "Could not cancel return request");
            if (status === 404) refreshRequests();
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            className={className}
            onClick={pending ? cancelReturn : sendReturn}
            disabled={busy || !bookId}
            title={pending ? "Cancel return request" : "Request return"}
            aria-label={pending ? "Cancel return request" : `Request return of ${title}`}
        >
            {busy
                ? <span className='loading loading-spinner loading-xs'></span>
                : pending ? <XIcon className='size-4' /> : <Undo2Icon className='size-4' />
            }
        </button>
    )
}

export default ReturnBtn;