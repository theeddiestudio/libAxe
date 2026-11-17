import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Undo2Icon } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '../lib/axios'
import { useAuth } from '../context/AuthContext'
import { useBooks } from '../context/BooksContext'
import { getErrorMessage } from '../lib/utils'

const ReturnBtn = ({ book, className = "btn btn-outline btn-sm"}) => {
    const [loading, setLoading] = useState(false);
    const {user, clearAuth} = useAuth();
    const {markReturned, refreshBooks} = useBooks();
    const navigate = useNavigate();

    const handleReturn = async () => {
        if(loading) return;
        if (!window.confirm(`Return "${book.title}"?`)) return;

        setLoading(true);
        try {
            await userApi.delete(`/${book._id}`);
            toast.success("Book returned successfully");
            markReturned(book._id, user._id)
        } catch (error) {
            console.log("Error returning book:", error);
            const status = error.response?.status;

            if (status === 429) {
                toast.error("Too many requests", { duration: 4000, icon: "💀" });
            } else if (status === 401) {
                clearAuth();
                toast.error("Session expired, please login again");
                navigate("/login");
            } else if (!error.response) {
                toast.error("Cannot reach the server");
            } else {
                toast.error(getErrorMessage(error, "Could not return book"));
                if (status === 400 || status === 404) refreshBooks(true);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <button className={className} onClick={handleReturn} disabled={loading} title='Return book' aria-label='Return Book'>
            {loading
                ? <span className='loading loading-spinner loading-xs'></span>
                : <Undo2Icon className='size-4' />
            }
        </button>
    )
}

export default ReturnBtn;