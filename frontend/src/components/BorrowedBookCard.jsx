import { Link } from "react-router";
import BookCover from "./BookCover";
import ReturnBtn from "./ReturnBtn";

const BorrowedBookCard = ({book}) => (
    <div className="card card-side bg-base-100 shadow-sm">
        <figure className="w-24 shrink-0 bg-base-200 p-2 sm:w-32">
            <Link to={`/books/${book._id}`} className="block h-full w-full min-h-32">
                <BookCover src={book.coverImage} title={book.title} />
            </Link>
        </figure>

        <div className="card-body min-w-0 gap-1 p-4">
            <span className="badge badge-outline badge-sm max-w-full truncate">{book.category}</span>

            <Link to={`/books/${book._id}`}>
                <h2 className="line-clamp-2 wrap-break-word text-lg font-semibold leading-snug" title={book.title}>
                {book.title}
                </h2>
            </Link>

            <p className="truncate text-sm opacity-70" title={book.author}>{book.author}</p>

            <div className="card-actions mt-auto justify-end pt-2">
                <ReturnBtn book={book} />
            </div>
        </div>
    </div>
)

export default BorrowedBookCard;