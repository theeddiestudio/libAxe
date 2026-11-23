import { useState, useEffect, useMemo } from 'react'
import { PlusIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBooks } from '../context/BooksContext'
import { matchesSearch } from '../lib/utils'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import BookCard from '../components/BookCard'
import CategoryFilter from '../components/CategoryFilter'
import SearchInput from '../components/SearchInput'
import BookFormModal from '../components/BookFormModal'
import BooksNotFound from '../components/BooksNotFound'
import RateLimited from '../components/RateLimited'

const Home = () => {
    const {isLogged, user, isAdmin} = useAuth();
    const {books, loading, isRateLimited, refreshBooks} = useBooks();
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        refreshBooks();
    }, [refreshBooks]);

    const visibleBooks = useMemo(() => {
        const myId = user?._id;
        return books
            .filter((b) => !(myId && b.reservedBy?.includes(myId)))
            .filter((b) => category === 'All' || b.category === category)
            .filter((b) => matchesSearch(b, search))
            .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
    }, [books, user, category, search]);

    if (loading || isLogged === null) {
        return (
            <div className='min-h-screen bg-base-200'>
                <Navbar />
                <Loader />
            </div>
        )
    }

    const searching = search.trim() !== "";

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            {isRateLimited && <RateLimited />}

            {!isRateLimited && (
                <main className="mx-auto max-w-6xl p-4">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                        <h1 className="text-3xl tracking-tight font-bold">Main Collection</h1>
                        <div className="flex items-center gap-3">
                            <p className="font-mono text-sm opacity-70">
                                {visibleBooks.length} books
                            </p>
                            {isAdmin && (
                                <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
                                    <PlusIcon className="size-4" />
                                    Add Book
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search by title or author..."
                        />
                    </div>

                    <CategoryFilter active={category} onChange={setCategory} />

                    {books.length === 0 && <BooksNotFound />}

                    {books.length > 0 && visibleBooks.length === 0 && (
                        <>
                            <BooksNotFound
                                title={searching ? "No matches" : category === 'All' ? "Nothing left to borrow" : "No books in this category"}
                                message={searching
                                    ? `Nothing found for "${search.trim()}". Check the spelling or try fewer words.`
                                    : category === 'All'
                                        ? "You have borrowed every book in the collection."
                                        : "Try another category."
                                }
                            />
                            {searching && (
                                <div className="flex justify-center">
                                    <button className="btn btn-primary btn-sm" onClick={() => setSearch("")}>
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </>
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

            {adding && <BookFormModal onClose={() => setAdding(false)} />}
        </div>
    )
}

export default Home