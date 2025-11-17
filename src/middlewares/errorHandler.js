const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, {
        message: err.message,
        stack: err.stack
    });

    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || err.statusCode || 500;
    const response = status >= 500 ? 'Internal server error' : err.message;
    res.status(status).json({ error: response });
};

module.exports = errorHandler;
