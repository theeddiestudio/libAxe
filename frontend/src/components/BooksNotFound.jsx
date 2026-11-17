import { BookIcon } from "lucide-react";

const BooksNotFound = ({title = "No books found", message = "Check back later for new arrivals."}) => (
    <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center px-4 py-10 text-center">
        <div className="mb-3 rounded-xl bg-base-300 p-5">
            <BookIcon className="size-12" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm opacity-70">{message}</p>
    </div>
)

export default BooksNotFound
