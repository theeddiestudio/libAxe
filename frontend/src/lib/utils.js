export const PASSWORD_HINT = "8-16 characters: at least one number and one capital letter.";
export const USERNAME_HINT = "5-20 characters: letters, numbers, dots, dashes or underscores.";

export const CATEGORIES = ['Fiction', 'Biography', 'Science', 'Politics', 'Self Growth'];

export function getErrorMessage(error, fallback = "Something went wrong") {
    return error?.response?.data?.message || fallback;
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
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