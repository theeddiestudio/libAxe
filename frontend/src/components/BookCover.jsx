import { useState } from "react";
import {BookIcon} from 'lucide-react'

const BookCover = ({src, title}) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-md bg-base-300 text-base-content/40">
                <BookIcon className="size-12" />
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={`Cover of ${title}`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
        />
    )
}

export default BookCover;