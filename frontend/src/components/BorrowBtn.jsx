import { useState } from "react";
import { useNavigate } from "react-router";
import {BookmarkPlusIcon} from "lucide-react"
import toast from 'react-hot-toast';
import {userApi} from "../lib/axios";
import {useAuth} from "../context/AuthContext"
import { useBooks } from "../context/BooksContext";
import { getErrorMessage } from "../lib/utils";

const BorrowBtn = ({ book, className = "btn btn-primary flex-1" }) => {
    const [loading, setLoading] = useState(false);
    const {isLogged, user, clearAuth} = useAuth();
    const {markBorrowed, refreshBooks} = useBooks();
    const navigate = useNavigate();

    const outOfStock = book.stock <= 0

    const handleBorrow = async () => {
        if (loading || outOfStock) return;

        if(!isLogged) {
            toast("Please login to borrow books", {icon: "🔒"});
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            await userApi.put(`/${book._id}`);
            toast.success("Book borrowed successfully");
            markBorrowed(book._id, user._id);
        } catch (error) {
            console.log("Error borrowing book:", error);
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
                toast.error(getErrorMessage(error, "Could not borrow book"));
                if (status === 400 || status === 404) refreshBooks(true);
            }
            
        } finally {
            setLoading(false);
        }
    }

    return (
        <button className={className} onClick={handleBorrow} disabled={outOfStock || loading}>
            {loading
                ? <span className="loading loading-spinner loading-sm"></span>
                : <BookmarkPlusIcon className="size-4" />
            }
            <span>{outOfStock ? "Out of Stock" : "Borrow Book"}</span>
        </button>
    )
}

export default BorrowBtn;