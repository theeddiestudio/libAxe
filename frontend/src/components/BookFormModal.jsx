import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { booksApi } from "../lib/axios";
import { useBooks } from "../context/BooksContext";
import { useApiError } from "../hooks/useApiError";
import { CATEGORIES } from "../lib/utils";

const BookFormModal = ({ book, onClose }) => {
    const isEdit = Boolean(book);
    const { upsertBook } = useBooks();
    const handleApiError = useApiError();

    const dialogRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: book?.title ?? "",
        author: book?.author ?? "",
        description: book?.description ?? "",
        category: book?.category ?? CATEGORIES[0],
        publishedYear: book?.publishedYear ?? "",
        stock: book?.stock ?? 1,
        pricePerDay: book?.pricePerDay ?? 1,
        overduePerDay: book?.overduePerDay ?? 2,
        coverImage: book?.coverImage ?? "",
    });

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        if (!form.title.trim() || !form.author.trim() || !form.description.trim()) {
            return "Title, author and description are required";
        }

        const stock = Number(form.stock);
        if (form.stock === "" || !Number.isInteger(stock) || stock < 0) {
            return "Stock must be a whole number, zero or more";
        }

        const prices = [["Price per day", form.pricePerDay], ["Overdue price per day", form.overduePerDay]];
        for (const [label, value] of prices) {
            if (value === "" || Number.isNaN(Number(value)) || Number(value) < 0) {
                return `${label} must be zero or more`;
            }
        }

        if (form.publishedYear !== "" && !Number.isInteger(Number(form.publishedYear))) {
            return "Published year must be a whole number";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        const problem = validate();
        if (problem) {
            toast.error(problem);
            return;
        }

        const payload = {
            title: form.title.trim(),
            author: form.author.trim(),
            description: form.description.trim(),
            category: form.category,
            stock: Number(form.stock),
            pricePerDay: Number(form.pricePerDay),
            overduePerDay: Number(form.overduePerDay),
            coverImage: form.coverImage.trim(),
        };
        if (form.publishedYear !== "") payload.publishedYear = Number(form.publishedYear);

        setSaving(true);
        try {
            const res = isEdit
                ? await booksApi.put(`/${book._id}`, payload)
                : await booksApi.post("/", payload);

            upsertBook(res.data);
            toast.success(isEdit ? "Book updated" : "Book added");
            onClose();
        } catch (error) {
            handleApiError(error, isEdit ? "Could not update the book" : "Could not add the book");
        } finally {
            setSaving(false);
        }
    };

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-xl">
                <h3 className="text-lg font-bold">{isEdit ? "Edit book" : "Add a new book"}</h3>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Title</span>
                        <input className="input w-full" value={form.title} onChange={set("title")} />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Author</span>
                        <input className="input w-full" value={form.author} onChange={set("author")} />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Description</span>
                        <textarea className="textarea w-full" rows={3} value={form.description} onChange={set("description")} />
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Category</span>
                            <select className="select w-full" value={form.category} onChange={set("category")}>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Published year (optional)</span>
                            <input type="number" className="input w-full" value={form.publishedYear} onChange={set("publishedYear")} />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Copies on the shelf</span>
                            <input type="number" min="0" step="1" className="input w-full" value={form.stock} onChange={set("stock")} />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Cover image link (optional)</span>
                            <input className="input w-full" placeholder="https://..." value={form.coverImage} onChange={set("coverImage")} />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Price per day</span>
                            <input type="number" min="0" step="0.01" className="input w-full" value={form.pricePerDay} onChange={set("pricePerDay")} />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Price per day when overdue</span>
                            <input type="number" min="0" step="0.01" className="input w-full" value={form.overduePerDay} onChange={set("overduePerDay")} />
                        </label>
                    </div>

                    <div className="modal-action mt-2">
                        <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving
                                ? <span className="loading loading-spinner loading-sm"></span>
                                : isEdit ? "Save changes" : "Add book"
                            }
                        </button>
                    </div>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
};

export default BookFormModal;