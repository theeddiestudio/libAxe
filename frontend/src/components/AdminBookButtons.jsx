import { useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { booksApi } from "../lib/axios";
import { useBooks } from "../context/BooksContext";
import { useApiError } from "../hooks/useApiError";
import BookFormModal from "./BookFormModal";

const AdminBookButtons = ({ book, className = "flex-1", onDeleted }) => {
    const { removeBook } = useBooks();
    const handleApiError = useApiError();

    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);

    const handleDelete = async () => {
        if (busy) return;
        if (!window.confirm(`Delete "${book.title}" permanently? Requests waiting for it will be cancelled.`)) return;

        setBusy(true);
        try {
            await booksApi.delete(`/${book._id}`);
            removeBook(book._id);
            toast.success("Book deleted");
            onDeleted?.();
        } catch (error) {
            handleApiError(error, "Could not delete the book");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button className={`btn btn-outline ${className}`} onClick={() => setEditing(true)} disabled={busy}>
                <PencilIcon className="size-4" />
                <span>Edit</span>
            </button>
            <button className={`btn btn-outline btn-error ${className}`} onClick={handleDelete} disabled={busy}>
                {busy
                    ? <span className="loading loading-spinner loading-xs"></span>
                    : <Trash2Icon className="size-4" />
                }
                <span>Delete</span>
            </button>

            {editing && <BookFormModal book={book} onClose={() => setEditing(false)} />}
        </>
    );
};

export default AdminBookButtons;