export const PASSWORD_HINT = "8-16 characters: at least one number and one capital letter.";
export const USERNAME_HINT = "5-20 characters: letters, numbers, dots, dashes or underscores.";

export const CATEGORIES = ['Fiction', 'Biography', 'Science', 'Politics', 'Self Growth'];

export const MIN_LOAN_DAYS = 1;
export const MAX_LOAN_DAYS = 30;

export const CURRENCY = '$';

export function getErrorMessage(error, fallback = "Something went wrong") {
    return error?.response?.data?.message || fallback;
}

// landing page after login
export function homeFor(user) {
    return user?.role === 'admin' ? '/admin' : '/profile';
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

export function formatMoney(amount) {
    return `${CURRENCY}${Number(amount).toFixed(2)}`;
}

export function formatDays(count) {
    return `${count} ${count === 1 ? "day" : "days"}`;
}

export function requestBookId(request) {
    return typeof request.book === 'object' ? request.book?._id : request.book;
}

export function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

    if (seconds < 60) return "just now";

    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
}


export function notificationLink(notification, isAdmin) {
    if (isAdmin) return notification.requestType === "return" ? "/admin?tab=return" : "/admin?tab=borrow";
    if (notification.type === "approved") return "/profile";
    if (notification.type === "denied" && notification.book) return `/books/${notification.book}`;
    return null; 
}

export function matchesSearch(book, text) {
    const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean).slice(0, 5);
    if (words.length === 0) return true;

    const haystack = `${book.title ?? ""} ${book.author ?? ""}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
}

export function lateDays(loan) {
    const lateMs = new Date(loan.returnedAt).getTime() - new Date(loan.dueAt).getTime();
    return lateMs > 0 ? Math.ceil(lateMs / (24 * 60 * 60 * 1000)) : 0;
}

export function daysUntil(dateString) {
    const leftMs = new Date(dateString).getTime() - Date.now();
    return leftMs > 0 ? Math.ceil(leftMs / (24 * 60 * 60 * 1000)) : 0;
}

export function validateUsername(username) {
    if (username.length < 5 || username.length > 20) {
        return "Username must be 5 to 20 characters";
    }
    if (!/^[A-Za-z]/.test(username)) {
        return "Username must start with a letter"
    }
    if (!/^[A-Za-z0-9_.-]+$/.test(username)) {
        return "Username can only include letters, numbers, dots, dashes or underscores";
    }
    return null;
}

export function validatePassword(password) {
    if(password.length < 8 || password.length > 16) {
        return "Password must be 8 to 16 characters long";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password needs at least one capital letter";
    }
    if (!/\d/.test(password)) {
        return "Password needs at least one number"
    }
    return null;
}