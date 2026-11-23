import { useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useLoans } from '../context/LoansContext'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import ProfileHeader from '../components/ProfileHeader'
import LoanCard from '../components/LoanCard'
import UnpaidLoanRow from '../components/UnpaidLoanRow'
import BooksNotFound from '../components/BooksNotFound'
import RateLimited from '../components/RateLimited'

const Profile = () => {
    const {user} = useAuth();
    const {loaded, active, unpaid, totalAccruing, totalUnpaid, failed, isRateLimited, refreshLoans} = useLoans();

    useEffect(() => {
        refreshLoans();
    }, [refreshLoans]);

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <main className="mx-auto max-w-4xl space-y-6 p-4">
                {user && (
                    <ProfileHeader
                        user={user}
                        loanCount={active.length}
                        accruing={totalAccruing}
                        unpaid={totalUnpaid}
                    />
                )}

                {!loaded && isRateLimited && <RateLimited />}

                {!loaded && failed && (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <p className="opacity-70">We could not load your loans.</p>
                        <button className="btn btn-primary btn-sm" onClick={refreshLoans}>Try again</button>
                    </div>
                )}

                {!loaded && !isRateLimited && !failed && <Loader />}

                {loaded && (
                    <>
                        <section>
                            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
                                Currently Borrowed
                                <span className='badge badge-primary badge-soft'>{active.length}</span>
                            </h2>

                            {active.length === 0 ? (
                                <>
                                    <BooksNotFound
                                        title='No borrowed books'
                                        message='Books you borrow will show up here.'
                                    />
                                    <div className="flex justify-center">
                                        <Link to={"/"} className='btn btn-primary btn-sm'>Browse Catalog</Link>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {active.map((loan) => (
                                        <LoanCard key={loan._id} loan={loan} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {unpaid.length > 0 && (
                            <section>
                                <h2 className="mb-1 flex items-center gap-2 text-xl font-bold">
                                    Payments Due
                                    <span className='badge badge-error badge-soft'>{unpaid.length}</span>
                                </h2>
                                <p className="mb-3 text-sm opacity-70">
                                    These books are back. Pay at the library desk, and an admin will mark them as paid.
                                </p>
                                <div className="flex flex-col gap-2">
                                    {unpaid.map((loan) => (
                                        <UnpaidLoanRow key={loan._id} loan={loan} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

export default Profile;