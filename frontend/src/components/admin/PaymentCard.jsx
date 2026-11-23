import { Trash2Icon, Undo2Icon, CheckIcon } from "lucide-react";
import { daysUntil, formatDate, formatDays, formatMoney, lateDays } from "../../lib/utils";

const PaymentCard = ({ loan, busy, onPay, onUndo, onDelete }) => {
    const { user, book } = loan;
    const late = lateDays(loan);

    const breakdown = `${formatDays(loan.days)} × ${formatMoney(loan.pricePerDay)}`
        + (late > 0 ? ` + ${formatDays(late)} late × ${formatMoney(loan.overduePerDay)}` : "");

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold" title={book?.title}>{book?.title ?? "Removed book"}</p>
                    <p className="min-w-0 truncate text-sm">
                        <span className="font-medium">{user?.username ?? "Deleted user"}</span>
                        {user?.email && <span className="opacity-60"> · {user.email}</span>}
                    </p>
                    <p className="text-xs opacity-60">
                        Returned {formatDate(loan.returnedAt)}
                        {late > 0 && ` · ${formatDays(late)} late`}
                    </p>
                    {loan.paid && (
                        <p className="text-xs opacity-60">
                            Paid {formatDate(loan.paidAt)}
                            {loan.expireAt && ` · removed automatically in ${formatDays(daysUntil(loan.expireAt))}`}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span className="text-xl font-bold" title={breakdown}>{formatMoney(loan.totalCost ?? 0)}</span>

                    <div className="flex gap-2">
                        {!loan.paid && (
                            <button className="btn btn-success btn-sm" onClick={onPay} disabled={busy}>
                                {busy
                                    ? <span className="loading loading-spinner loading-xs"></span>
                                    : <CheckIcon className="size-4" />
                                }
                                Mark paid
                            </button>
                        )}

                        {loan.paid && loan.totalCost > 0 && (
                            <button className="btn btn-ghost btn-sm" onClick={onUndo} disabled={busy}>
                                <Undo2Icon className="size-4" />
                                Undo
                            </button>
                        )}

                        {loan.paid && (
                            <button className="btn btn-outline btn-error btn-sm" onClick={onDelete} disabled={busy}>
                                <Trash2Icon className="size-4" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCard;