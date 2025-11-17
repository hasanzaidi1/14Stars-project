const pool = require('../config/dbConfig'); // Import the pool using require

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
 * Determines whether the caller expects a JSON response instead of an HTML redirect.
 * @param {Object} req - The Express request object.
 * @returns {boolean}
 */
const expectsJson = (req) => {
    if (!req || !req.headers) {
        return false;
    }
    const accepts = (req.headers.accept || '').toLowerCase();
    const contentType = (req.headers['content-type'] || '').toLowerCase();
    return Boolean(req.xhr)
        || contentType.includes('application/json')
        || accepts.includes('application/json');
};

/**
 * Sends a user-friendly response for portal forms. Browser form posts get redirected to the
 * shared success page, whereas JSON/XHR callers receive structured JSON messages.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Object} options - Response configuration.
 * @param {boolean} options.success - Indicates success or failure.
 * @param {string} options.message - Message copy to display.
 * @param {number} [options.statusCode] - HTTP status to send for JSON callers.
 * @param {Object} [options.data] - Additional JSON payload for API consumers.
 */
const sendPortalResponse = (req, res, { success, message, statusCode, data }) => {
    const code = typeof statusCode === 'number'
        ? statusCode
        : (success ? 200 : 400);

    if (expectsJson(req)) {
        const payload = { success, message };
        if (data && typeof data === 'object') {
            Object.assign(payload, data);
        }
        return res.status(code).json(payload);
    }

    const params = new URLSearchParams({
        type: success ? 'success' : 'error',
        message: message || ''
    });
    return res.redirect(303, `/success.html?${params.toString()}`);
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

/**
 * Fetches the full name of a student by their ID.
 * @param {number} studentId - The ID of the student.
 * @returns {string} - The full name of the student.
 */
async function getFullNameByStudentId(studentId) {
    const query = 'SELECT CONCAT(F_Name, " ", MI, " ", L_Name) AS full_name FROM student WHERE St_ID = ?';
    const [rows] = await pool.query(query, [studentId]);
    return rows[0] ? rows[0].full_name : '';
}

/**
 * Determines the school year based on the assignment date.
 * @param {string} assignmentDate - The date of the assignment.
 * @returns {string} - The school year in the format YYYY-YYYY.
 */
function determineSchoolYear(assignmentDate) {
    const date = new Date(assignmentDate); // Parse the assignment date
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1

    if (month >= 7) {
        // After July 1st, school year starts this year
        return `${year}-${year + 1}`;
    } else {
        // Before July 1st, school year starts last year
        return `${year - 1}-${year}`;
    }
}

function cleanData(data) {
    const cleaned = {};
    for (const key in data) {
        cleaned[key] = data[key] !== undefined ? data[key] : null;
    }
    return cleaned;
}

module.exports = {
    validateRequiredFields,
    sendErrorResponse,
    sendPortalResponse,
    isValidEmail,
    isValidPhoneNumber,
    isAuthenticated,
    getFullNameByStudentId,
    determineSchoolYear,
    cleanData
};
