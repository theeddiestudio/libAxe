import { useEffect, useRef, useState } from "react";
import { MIN_LOAN_DAYS, MAX_LOAN_DAYS, formatMoney } from "../lib/utils.js";

const QUICK_DAYS = [3,7,14,30];

const RequestModal = ({book, submitting, onSubmit, onClose}) => {
    const dialogRef = useRef(null);
    const [days, setDays] = useState(7);

    useEffect(() => {
        dialogRef.current?.showModal();
    }, [])

    const validDays = Number.isInteger(days) && days >= MIN_LOAN_DAYS && days <= MAX_LOAN_DAYS;
    const hasPrices = book.pricePerDay != null && book.overduePerDay != null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validDays && !submitting) onSubmit(days);
    };

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose} >
            <div className="modal-box">
                <h3 className="text-lg font-bold">Request Borrow</h3>
                <p className="mt-1 truncate text-sm opacity-70">{book.title}</p>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium">How many days will you keep it?</span>
                        <input
                            type="number"
                            className="input w-full"
                            min={MIN_LOAN_DAYS}
                            max={MAX_LOAN_DAYS}
                            value={Number.isNaN(days) ? "" : days}
                            onChange={(e) => setDays(e.target.value === '' ? NaN : Number(e.target.value))}
                        />
                        <span className="text-xs opacity-60">
                            Between {MIN_LOAN_DAYS} and {MAX_LOAN_DAYS} days, whole numbers only.
                        </span>
                    </label>

                    <div className="flex flex-wrap gap-2">
                        {QUICK_DAYS.map((d) => (
                            <button
                                key={d}
                                type="button"
                                className={`btn btn-xs ${days === d ? "btn-primary" : "btn-soft"}`}
                                onClick={() => setDays(d)}
                            >
                                {d} days
                            </button>
                        ))}
                    </div>

                    {hasPrices && validDays && (
                        <div className="rounded-box bg-base-200 p-3 text-sm">
                            <div className="flex justify-between">
                                <span>Cost for {days} {days === 1 ? "day" : "days"}</span>
                                <span className="font-semibold">
                                    {formatMoney(days * book.pricePerDay)}
                                </span>
                            </div>
                            <p className="mt-1 text-xs opacity-60">
                                Each day after the due date costs {formatMoney(book.overduePerDay)}.
                            </p>
                        </div>
                    )}

                    <div className="modal-action mt-0">
                        <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!validDays || submitting}>
                            {submitting
                                ? <span className="loading loading-spinner loading-sm"></span>
                                : "Send request"
                            }
                        </button>
                    </div>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}

export default RequestModal;