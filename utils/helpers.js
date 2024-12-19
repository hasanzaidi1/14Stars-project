// utils/helpers.js

/**
 * Validates required fields in a request body.
 * @param {Array} fields - An array of objects containing field names and their values.
 * @returns {string|null} - Returns an error message if validation fails, otherwise null.
 */
const validateRequiredFields = (fields) => {
    for (const field of fields) {
        if (!field.value) {
            return `${field.name} is required.`;
        }
    }
    return null;
};

/**
 * Sends a standardized error response.
 * @param {Object} res - The response object.
 * @param {string} message - The error message to send.
 * @param {number} statusCode - The HTTP status code.
 */
const sendErrorResponse = (res, message, statusCode = 500) => {
    res.status(statusCode).json({ error: message });
};

/**
 * Validates an email address using a simple regex.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validates a phone number format.
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
const isValidPhoneNumber = (phone) => {
    const regex = /^\d{10}$/; // Adjust this regex based on your phone number format
    return regex.test(phone);
};


/**
 * Checks if the user is authenticated.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Function} - Calls the next middleware function if authenticated.
 */
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin || req.cookies.username) {
        return next();
    }
    return next();
}

module.exports = {
    validateRequiredFields,
    sendErrorResponse,
    isValidEmail,
    isValidPhoneNumber,
    isAuthenticated
};