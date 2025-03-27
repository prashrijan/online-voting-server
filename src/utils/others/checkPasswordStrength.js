/**
 * Checks the strength of a given password based on specific criteria.
 *
 * A password is considered strong if it meets the following conditions:
 * - Has a minimum length of 6 characters.
 * - Contains at least one uppercase letter (A-Z).
 * - Contains at least one lowercase letter (a-z).
 * - Contains at least one numeric digit (0-9).
 * - Contains at least one special character (!@#$%^&*(),.?":{}|<>).
 *
 * @param {string} password - The password to be evaluated.
 * @returns {boolean} Returns `true` if the password meets all the criteria, otherwise `false`.
 */
export const checkPasswordStrength = (password) => {
    if (
        password.length >= 6 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
        return true;
    } else {
        return false;
    }
};
