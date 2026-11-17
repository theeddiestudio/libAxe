import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBooks } from '../context/BooksContext'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import BookCard from '../components/BookCard'
import CategoryFilter from '../components/CategoryFilter'
import BooksNotFound from '../components/BooksNotFound'
import RateLimited from '../components/RateLimited'

const Home = () => {
    const {isLogged, user} = useAuth();
    const {books, loading, isRateLimited, refreshBooks} = useBooks();
    const [category, setCategory] = useState("All");

    useEffect(() => {
        refreshBooks();
    }, [refreshBooks]);

    const visibleBooks = useMemo(() => {
        const myId = user?._id;
        return books
            .filter((b) => !(myId && b.reservedBy?.includes(myId)))
            .filter((b) => category === 'All' || b.category === category)
            .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
    }, [books, user, category]);

    if (loading || isLogged === null) {
        return (
            <div className='min-h-screen bg-base-200'>
                <Navbar />
                <Loader />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            {isRateLimited && <RateLimited />}

            {!isRateLimited && (
                <main className="mx-auto max-w-6xl p-4">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                        <h1 className="text-3xl tracking-tight font-bold">Main Collection</h1>
                        <p className="font-mono text-sm opacity-70">
                            {visibleBooks.length} books
                        </p>
                    </div>

                    <CategoryFilter active={category} onChange={setCategory} />

                    {books.length === 0 && <BooksNotFound />}

                    {books.length > 0 && visibleBooks.length === 0 && (
                        <BooksNotFound
                            title={category === 'All' ? "Nothing left to borrow" : "No books in this category"}
                            message={category === 'All' ? "You have borrowed every book in the collection." : "Try another category." }
                        />
                    )}

                    {visibleBooks.length > 0 && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleBooks.map((book) => (
                                <BookCard
                                    key={book._id}
                                    book={book}
                                />
                            ))}
                        </div>
                    )}
                </main>
            )}
        </div>
    )
}

export default Home