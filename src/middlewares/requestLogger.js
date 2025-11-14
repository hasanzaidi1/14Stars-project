const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const start = process.hrtime.bigint();
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent');
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    req.id = requestId;
    res.setHeader('x-request-id', requestId);

    res.on('finish', () => {
        const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
        logger.info(`${method} ${originalUrl}`, {
            statusCode: res.statusCode,
            durationMs: duration.toFixed(2),
            userAgent,
            requestId
        });
    });

    res.on('close', () => {
        if (!res.writableEnded) {
            logger.warn(`Request aborted ${method} ${originalUrl}`, { requestId });
        }
    });

    next();
};

module.exports = requestLogger;
