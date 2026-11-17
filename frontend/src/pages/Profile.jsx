import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useBooks } from '../context/BooksContext'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import ProfileHeader from '../components/ProfileHeader'
import BorrowedBookCard from '../components/BorrowedBookCard'
import BooksNotFound from '../components/BooksNotFound'
import RateLimited from '../components/RateLimited'

const Profile = () => {
    const {user} = useAuth();
    const {books, loading, isRateLimited, refreshBooks} = useBooks();

    // refresh if cache is older than TTL
    useEffect(() => {
        refreshBooks();
    }, [refreshBooks]);

    const myBooks = useMemo(() => {
        if (!user) return [];
        return books.filter((b) => b.reservedBy?.includes(user._id));
    }, [books, user])

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            
            <main className="mx-auto max-w-4xl space-y-6 p-4">
                {user && <ProfileHeader user={user} loanCount={myBooks.length} />}

                <section>
                    <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
                        Currently Borrowed
                        {!loading && <span className='badge badge-primary badge-soft'>{myBooks.length}</span>}
                    </h2>

                    {loading && <Loader />}
                    {isRateLimited && <RateLimited />}

                    {!loading && !isRateLimited && myBooks.length === 0 && (
                        <>
                            <BooksNotFound
                                title='No borrowed books'
                                message='Books you borrow will show up here.'
                            />
                            <div className="flex justify-center">
                                <Link to={"/"} className='btn btn-primary btn-sm'>Browse Catalog</Link>
                            </div>
                        </>
                    )}

                    {!loading && !isRateLimited && myBooks.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {myBooks.map((b) => (
                                <BorrowedBookCard key={b._id} book={b} />
                            ))}
                        </div>
                    )}

                </section>
            </main>
        </div>
    )
}

export default Profile;