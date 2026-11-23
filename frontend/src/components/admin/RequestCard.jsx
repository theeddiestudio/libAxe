import { CheckIcon, XIcon } from "lucide-react";
import { daysUntil, formatDays, timeAgo } from "../../lib/utils";
import BookCover from "../BookCover";

const RequestCard = ({ request, busy, onApprove, onDeny }) => {
    const { user, book } = request;
    const isBorrow = request.type === "borrow";

    const title = book?.title ?? "Removed book";
    const noStock = isBorrow && (!book || book.stock <= 0);

    return (
        <div className="card card-side bg-base-100 shadow-sm">
            <figure className="hidden w-24 shrink-0 bg-base-200 p-2 sm:flex">
                <div className="h-full min-h-24 w-full">
                    <BookCover src={book?.coverImage} title={title} />
                </div>
            </figure>

            <div className="card-body min-w-0 gap-1 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="min-w-0 truncate text-lg font-semibold" title={title}>{title}</h2>
                    {isBorrow && book && (
                        <span className={`badge badge-sm ${book.stock > 0 ? "badge-success badge-soft" : "badge-error"}`}>
                            {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
                        </span>
                    )}
                </div>

                <p className="min-w-0 truncate text-sm">
                    <span className="font-medium">{user?.username ?? "Deleted user"}</span>
                    {user?.email && <span className="opacity-60"> · {user.email}</span>}
                </p>

                <p className="text-sm opacity-70">
                    {isBorrow ? `Wants it for ${formatDays(request.days)}` : "Wants to return this book"}
                    {" · "}asked {timeAgo(request.createdAt)}
                </p>
                <p className="text-xs opacity-50">Expires in {formatDays(daysUntil(request.expireAt))}</p>

                <div className="card-actions mt-2 justify-end">
                    <button className="btn btn-outline btn-error btn-sm" onClick={onDeny} disabled={busy}>
                        <XIcon className="size-4" />
                        Deny
                    </button>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={onApprove}
                        disabled={busy || noStock}
                        title={noStock ? "Out of stock: deny it, or wait for a return" : undefined}
                    >
                        {busy
                            ? <span className="loading loading-spinner loading-xs"></span>
                            : <CheckIcon className="size-4" />
                        }
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestCard;