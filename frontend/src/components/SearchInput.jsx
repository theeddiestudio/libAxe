import { SearchIcon, XIcon } from "lucide-react";

const SearchInput = ({ value, onChange, placeholder = "Search..." }) => (
    <label className="input w-full">
        <SearchIcon className="size-4 opacity-60" />
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
        {value && (
            <button
                type="button"
                className="opacity-60 hover:opacity-100"
                onClick={() => onChange("")}
                aria-label="Clear search"
            >
                <XIcon className="size-4" />
            </button>
        )}
    </label>
);

export default SearchInput;