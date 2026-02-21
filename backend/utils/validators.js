// ==========================================
// Validation Utility Functions
// ==========================================

/**
 * Validate full_name:
 * - Only letters and spaces allowed
 * - No numbers, no special characters
 * - Minimum 3 characters
 */
const isValidFullName = (name) => {
    const nameRegex = /^[A-Za-z\s]{3,}$/;
    return nameRegex.test(name.trim());
};

/**
 * Validate email:
 * - Must follow proper email format
 * - Example: example@gmail.com
 */
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate password:
 * - Minimum 6 characters
 * - Must contain at least one letter
 * - Must contain at least one special character
 * - Example valid: pass@123
 */
const isValidPassword = (password) => {
    if (password.length < 6) return false;

    const hasLetter = /[A-Za-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return hasLetter && hasSpecialChar;
};

module.exports = {
    isValidFullName,
    isValidEmail,
    isValidPassword,
};
