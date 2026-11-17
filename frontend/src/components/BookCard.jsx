import {Link} from 'react-router'
import { InfoIcon } from 'lucide-react'
import BookCover from './BookCover'
import BorrowBtn from './BorrowBtn'

const BookCard = ({ book }) => {
    const outOfStock = book.stock <=0;

    return (
        <div className='card bg-base-100 h-full shadow-sm'>
            <figure className="relative h-56 bg-base-200 p-4">
                <Link to={`/books/${book._id}`} className='h-full w-full'>
                    <BookCover src={book.coverImage} title={book.title} />
                </Link>
                <span className={`badge badge-sm absolute right-3 top-3 ${outOfStock ? "badge-error" : book.stock <= 2 ? "badge-error" : "badge-success"}`}>
                    { outOfStock
                        ? "Out of stock"
                        : `Available • ${book.stock} ${book.stock === 1 ? "copy" : "copies"}`
                    }
                </span>
            </figure>

            <div className="card-body flex-1 gap-2 p-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="badge badge-outline badge-sm max-w-[70%] truncate">{book.category}</span>
                    {book.publishedYear && <span className='font-mono opacity-60'>{book.publishedYear}</span>}
                </div>

                <Link to={`/books/${book._id}`}>
                    <h2 className="min-h-14 wrap-break-word text-lg font-semibold leading-snug line-clamp-2" title={book.title}>
                        {book.title}
                    </h2>
                </Link>

                <p className="truncate text-sm opacity-70" title={book.author}>{book.author}</p>
                <p className="min-h-10 wrap-break-word text-sm opacity-60 line-clamp-2">{book.description}</p>

                <div className="card-actions mt-auto flex-nowrap pt-2">
                    <BorrowBtn book={book} />
                    <Link to={`/books/${book._id}`} className='btn btn-outline btn-square' aria-label='View details'>
                        <InfoIcon className='size-4' />
                    </Link>
                </div>

            </div>
        
        </div>
    )
}

export default BookCard
