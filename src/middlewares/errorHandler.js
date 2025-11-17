const logger = require('../utils/logger');

const prefersJson = (req) => {
    const accept = (req.headers?.accept || '').toLowerCase();
    const contentType = (req.headers?.['content-type'] || '').toLowerCase();
    return Boolean(req.xhr)
        || accept.includes('application/json')
        || contentType.includes('application/json');
};

const prefersHtml = (req) => {
    const accept = (req.headers?.accept || '').toLowerCase();
    if (!accept.includes('text/html')) {
        return false;
    }
    return !prefersJson(req);
};

const escapeHtml = (value = '') => {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const buildErrorPage = ({ status, message, requestId }) => {
    const isServerError = status >= 500;
    const title = isServerError ? 'Something went wrong' : 'Please check and try again';
    const bodyCopy = isServerError
        ? 'We ran into an unexpected issue while processing your request. Please try again in a moment.'
        : message || 'We could not complete that request.';
    const safeMessage = escapeHtml(bodyCopy);
    const safeRequestId = requestId ? escapeHtml(requestId) : null;

    const primaryAction = isServerError
        ? "window.location.href='/index.html'"
        : 'window.history.back()';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header class="site-header">
        <a class="brand-mark" href="/index.html">14 Stars</a>
        <nav class="nav-links">
            <a class="nav-link" href="/index.html">Home</a>
            <a class="nav-link" href="/parents/parents_login.html">Parents</a>
            <a class="nav-link" href="/teachers/teachers.html">Teachers</a>
            <a class="nav-link" href="/admin/admin-login.html">Admin</a>
        </nav>
    </header>
    <main class="page-fill">
        <section class="card stack" style="max-width: 520px;">
            <p class="page-eyebrow">Portal Message</p>
            <h1>${escapeHtml(title)}</h1>
            <p class="text-muted">${safeMessage}</p>
            ${safeRequestId ? `<p class="text-muted">Reference ID: ${safeRequestId}</p>` : ''}
            <div class="btn-group">
                <button class="btn" type="button" onclick="${primaryAction}">${isServerError ? 'Return Home' : 'Go Back'}</button>
                <button class="btn btn--ghost" type="button" onclick="window.location.href='/index.html'">School Home</button>
            </div>
        </section>
    </main>
    <footer class="site-footer">
        <p>&copy; 2024 14 Stars Islamic School.</p>
    </footer>
    <script src="/scripts/ui.js" defer></script>
</body>
</html>`;
};

const errorHandler = (err, req, res, next) => {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, {
        message: err.message,
        stack: err.stack,
        requestId: req.id
    });

    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || err.statusCode || 500;
    const response = status >= 500 ? 'Internal server error' : err.message;

    if (prefersHtml(req)) {
        res.status(status).type('html').send(buildErrorPage({
            status,
            message: response,
            requestId: req.id
        }));
        return;
    }

    res.status(status).json({
        error: response,
        requestId: req.id
    });
};

module.exports = errorHandler;
