import { formatDate, formatDays, formatMoney } from "../lib/utils";

const UnpaidLoanRow = ({ loan }) => {
    const title = loan.book?.title ?? "Removed book";

    return (
        <div className="flex items-center justify-between gap-3 rounded-box bg-base-100 p-3 shadow-sm">
            <div className="min-w-0">
                <p className="truncate font-medium" title={title}>{title}</p>
                <p className="text-xs opacity-60">
                    Returned {formatDate(loan.returnedAt)}
                    {loan.overdue && ` · ${formatDays(loan.overdueDays)} late`}
                </p>
            </div>
            <span className="shrink-0 font-semibold">{formatMoney(loan.cost)}</span>
        </div>
    )
}

export default UnpaidLoanRow;