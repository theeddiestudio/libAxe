import { useState } from "react";
import toast from "react-hot-toast";
import { loansApi } from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";
import { useAdminList } from "../../hooks/useAdminList";
import { useApiError } from "../../hooks/useApiError";
import { formatMoney } from "../../lib/utils";
import Loader from "../Loader";
import RateLimited from "../RateLimited";
import BooksNotFound from "../BooksNotFound";
import PaymentCard from "./PaymentCard";

const PaymentsList = ({ paid, search }) => {
    const debouncedSearch = useDebounce(search, 400);
    const { items, loading, failed, isRateLimited, reload, setItems } = useAdminList(
        loansApi,
        { paid: String(paid), search: debouncedSearch.trim() }
    );
    const handleApiError = useApiError();

    const [busyId, setBusyId] = useState(null);

    
    const run = async (loan, call, message) => {
        if (busyId) return;

        setBusyId(loan._id);
        try {
            await call();
            toast.success(message);
            setItems((prev) => prev.filter((l) => l._id !== loan._id));
        } catch (error) {
            const status = handleApiError(error, "Something went wrong");
            if (status === 404 || status === 409) reload();
        } finally {
            setBusyId(null);
        }
    };

    const markPaid = (loan) => run(loan, () => loansApi.patch(`/${loan._id}/pay`), "Marked as paid");
    const undo = (loan) => run(loan, () => loansApi.patch(`/${loan._id}/unpay`), "Set back to unpaid");
    const remove = (loan) => {
        if (!window.confirm("Delete this paid loan record for good?")) return;
        run(loan, () => loansApi.delete(`/${loan._id}`), "Loan deleted");
    };

    if (isRateLimited) return <RateLimited />;
    if (loading && items.length === 0) return <Loader />;

    if (failed && items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="opacity-70">We could not load the payments.</p>
                <button className="btn btn-primary btn-sm" onClick={reload}>Try again</button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <BooksNotFound
                title={search.trim() ? "No matching payments" : paid ? "Nothing paid recently" : "Nothing to collect"}
                message={paid ? "Paid loans stay here for a few days before they are cleaned up." : "Returned books with a balance will show up here."}
            />
        );
    }

    const total = items.reduce((sum, loan) => sum + (loan.totalCost ?? 0), 0);

    return (
        <>
            {!paid && (
                <p className="text-sm opacity-70">
                    {items.length} {items.length === 1 ? "loan" : "loans"} · <span className="font-semibold">{formatMoney(total)}</span> to collect
                </p>
            )}

            <div className={`flex flex-col gap-3 transition-opacity ${loading ? "opacity-60" : ""}`}>
                {items.map((loan) => (
                    <PaymentCard
                        key={loan._id}
                        loan={loan}
                        busy={busyId === loan._id}
                        onPay={() => markPaid(loan)}
                        onUndo={() => undo(loan)}
                        onDelete={() => remove(loan)}
                    />
                ))}
            </div>

            {items.length >= 50 && (
                <p className="text-center text-xs opacity-60">Showing the first 50.</p>
            )}
        </>
    );
};

const PaymentsTab = ({ search }) => {
    const [paid, setPaid] = useState(false);

    return (
        <div className="space-y-4">
            <div className="join">
                <button className={`btn btn-sm join-item ${!paid ? "btn-primary" : ""}`} onClick={() => setPaid(false)}>
                    To collect
                </button>
                <button className={`btn btn-sm join-item ${paid ? "btn-primary" : ""}`} onClick={() => setPaid(true)}>
                    Recently paid
                </button>
            </div>

            <PaymentsList key={String(paid)} paid={paid} search={search} />
        </div>
    );
};

export default PaymentsTab;