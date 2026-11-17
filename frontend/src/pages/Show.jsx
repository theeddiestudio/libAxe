import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeftIcon, CircleCheckIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBooks } from '../context/BooksContext'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import BookCover from '../components/BookCover'
import BorrowBtn from '../components/BorrowBtn'
import BooksNotFound from '../components/BooksNotFound'
import RateLimited from '../components/RateLimited'

const Show = () => {
  const { id } = useParams();
  const { isLogged, user } = useAuth();
  const {books, loading, isRateLimited, refreshBooks} = useBooks();

  const book = books.find((b) => b._id === id);

  // check if the book is newly added if it is not found before we move to not found
  const [checkedId, setCheckedId] = useState(null);

  useEffect(() => {
    if(loading || book || checkedId === id) return;
    Promise.resolve(refreshBooks(true)).finally(() => setCheckedId(id));
  }, [loading, book, checkedId, id, refreshBooks])

  if (loading || isLogged === null || (!book && checkedId !== id && !isRateLimited)) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <Loader />
      </div>
    )
  }

  if (!book && isRateLimited) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <RateLimited />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <BooksNotFound
          title="Book not found"
          message="This book may have been removed, or the link is wrong."
        />
        <div className="flex justify-center">
          <Link to="/" className="btn btn-primary btn-sm">
            <ArrowLeftIcon className="size-4" />
            Back to Catalog
          </Link>
        </div>
      </div>
    )
  }

  const outOfStock = book.stock <= 0;
  const isBorrowed = Boolean(user && book.reservedBy?.includes(user._id));

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="mx-auto max-w-5xl p-4">
        <Link to="/" className="btn btn-ghost btn-sm mb-4">
          <ArrowLeftIcon className="size-4" />
          Back to Catalog
        </Link>

        <div className="card bg-base-100 shadow-sm md:card-side">
          <figure className="bg-base-200 p-6 md:w-80 md:shrink-0">
            <div className="h-72 w-full">
              <BookCover src={book.coverImage} title={book.title} />
            </div>
          </figure>

          <div className="card-body min-w-0 gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="badge badge-outline">{book.category}</span>
              {book.publishedYear && (
                <span className="font-mono opacity-60">{book.publishedYear}</span>
              )}
            </div>

            <h1 className="wrap-break-word text-2xl font-bold leading-snug md:text-3xl">
              {book.title}
            </h1>
            <p className="wrap-break-word text-lg opacity-70">{book.author}</p>

            <div>
              <span className={`badge ${outOfStock ? "badge-error" : "badge-success"}`}>
                {outOfStock
                  ? "Out of stock"
                  : `Available • ${book.stock} ${book.stock === 1 ? "copy" : "copies"}`}
              </span>
            </div>

            <p className="whitespace-pre-line wrap-break-word leading-relaxed opacity-80">
              {book.description}
            </p>

            <div className="card-actions mt-2">
              {isBorrowed ? (
                <div className="alert alert-success alert-soft w-full">
                  <CircleCheckIcon className="size-5" />
                  <span>You have borrowed this book.</span>
                  <Link to="/profile" className="btn btn-sm">Go to Profile</Link>
                </div>
              ) : (
                <BorrowBtn book={book} className="btn btn-primary w-full sm:w-auto" />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Show