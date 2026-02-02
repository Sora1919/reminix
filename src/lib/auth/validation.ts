const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
    return emailRegex.test(email);
}

export function isStrongPassword(password: string) {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    return (
        password.length >= PASSWORD_MIN_LENGTH &&
        hasLower &&
        hasUpper &&
        hasNumber
    );
}

export function normalizeName(name: string) {
    return name.trim().replace(/\s+/g, " ");
}
