import { CATEGORIES } from "../lib/utils"

const CategoryFilter = ({active, onChange}) => {
    return (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {["All", ...CATEGORIES].map((item) => (
                <button
                    key={item}
                    onClick={() => onChange(item)}
                    className={`btn btn-sm shrink-0 rounded-full ${active === item ? "btn-primary" : "btn-soft"}`}
                >
                    {item === "All" ? "All Books" : item}
                </button>
            ))}
        </div>
    )
}

export default CategoryFilter
