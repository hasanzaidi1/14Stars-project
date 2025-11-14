const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../../public_html');
const HTML_EXTENSION = '.html';

const isHtmlRequest = (req) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
        return false;
    }
    return true;
};

const redirectHtmlRequests = (req, res, next) => {
    if (!isHtmlRequest(req)) {
        return next();
    }

    if (req.path.endsWith(HTML_EXTENSION)) {
        const targetPath = req.path.slice(0, -HTML_EXTENSION.length) || '/';
        const query = req.url.slice(req.path.length);
        return res.redirect(301, `${targetPath}${query}`);
    }
    return next();
};

const serveExtensionlessHtml = (req, res, next) => {
    if (!isHtmlRequest(req)) {
        return next();
    }
    if (path.extname(req.path)) {
        return next();
    }

    const normalizedPath = path.posix.normalize(req.path);
    if (normalizedPath.includes('..')) {
        return next();
    }

    let relativePath = normalizedPath.replace(/^\/+/, '').replace(/\/$/, '');
    if (!relativePath) {
        relativePath = 'index';
    }

    const candidates = [];
    candidates.push(path.join(PUBLIC_DIR, `${relativePath}${HTML_EXTENSION}`));

    const segments = relativePath.split('/');
    const lastSegment = segments[segments.length - 1];
    const nestedCandidate = path.join(PUBLIC_DIR, relativePath, `${lastSegment}${HTML_EXTENSION}`);
    if (!candidates.includes(nestedCandidate)) {
        candidates.push(nestedCandidate);
    }

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return res.sendFile(candidate);
        }
    }

    next();
};

module.exports = {
    redirectHtmlRequests,
    serveExtensionlessHtml
};
