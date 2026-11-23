import { Link } from "react-router";
import { useRequests } from "../context/RequestsContext.jsx";
import { formatDate, formatDays, formatMoney } from "../lib/utils.js"
import BookCover from "./BookCover.jsx";
import ReturnBtn from "./ReturnBtn.jsx";

const getStatus = (loan) => {
    console.log(loan.overdueDays)
    if (loan.overdue) {
        return {className: "badge-error", text: `Overdue by ${formatDays(loan.overdueDays)}`};
    }

    const text = loan.daysRemaining === 0 ? "Due today" : `Due in ${formatDays(loan.daysRemaining)}`;
    return {className: loan.daysRemaining <=2 ? "badge-warning" : "badge-success", text};
}

const LoanCard = ({loan}) => {
    const { pendingReturn} = useRequests()

    const book = loan.book;
    const title = book?.title ?? "Removed book";
    const returnPending = book ? pendingReturn.has(book._id) : false;
    const status = getStatus(loan);

    return (
        <div className="card card-side bg-base-100 shadow-sm">
            <figure className="w-24 shrink-0 bg-base-200 p-2 sm:w-32">
                {book ? (
                    <Link to={`/books/${book._id}`} className="block h-full w-full min-h-32" >
                        <BookCover src={book.coverImage} title={title} />
                    </Link>
                ) : (
                    <div className="h-full w-full min-h-32">
                        <BookCover title={title} />
                    </div>
                )}
            </figure>

            <div className="card-body min-w-0 gap-1 p-4">
                <div className="flex flex-wrap gap-1">
                    <span className={`badge badge-sm ${status.className}`}>{status.text}</span>
                    {returnPending && <span className="badge badge-sm badge-warning badge-soft">Return requested</span>}
                </div>

                <h2 className="line-clamp-2 wrap-break-word text-lg font-semibold leading-snug" title={title}>
                    {book ? <Link to={`/books/${book._id}`}>{title}</Link> : title}
                </h2>
                <p className="truncate text-sm opacity-70" title={book?.author}>{book?.author}</p>

                <p className="text-xs opacity-60">
                    Borrowed {formatDate(loan.borrowedAt)} · Due {formatDate(loan.dueAt)}
                </p>

                <div className="mt-1 text-sm">
                    <span className="opacity-70">Cost so far </span><span className="font-semibold">{formatMoney(loan.cost)}</span>
                    <p className="text-xs opacity-60">
                        {formatDays(loan.days)} × {formatMoney(loan.pricePerDay)}
                        {loan.overdue && ` + ${formatDays(loan.overdueDays)} late × ${formatMoney(loan.overduePerDay)}`}
                    </p>
                </div>

                <div className="card-actions mt-auto justify-end pt-2">
                    <ReturnBtn loan={loan} />
                </div>
            </div>
        </div>
    )
}

export default LoanCard
