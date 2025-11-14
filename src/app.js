require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const logger = require('./utils/logger');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const { redirectHtmlRequests, serveExtensionlessHtml } = require('./middlewares/htmlPageMiddleware');
const SessionStore = require('./config/sessionStore');
const teacherRoutes = require('./modules/teacher/teacher.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const parentRoutes = require('./modules/parent/parent.routes');
const substituteRoutes = require('./modules/substitute/substitute.routes');
const substituteRequestRoutes = require('./modules/substitute-request/substitute-request.routes');
const subjectRoutes = require('./modules/subject/subject.routes');
const levelRoutes = require('./modules/level/level.routes');
const studentLevelRoutes = require('./modules/student-level/student-level.routes');
const studentRoutes = require('./modules/student/student.routes');
const termRoutes = require('./modules/term/term.routes');

const logBindings = {
    log: 'info',
    info: 'info',
    warn: 'warn',
    error: 'error'
};
Object.entries(logBindings).forEach(([consoleMethod, loggerMethod]) => {
    console[consoleMethod] = logger[loggerMethod].bind(logger);
});

const isProduction = process.env.NODE_ENV === 'production';
const sessionTtlMinutes = parseInt(process.env.SESSION_TTL_MINUTES || '240', 10);
const sessionMaxAge = sessionTtlMinutes * 60 * 1000;
const sessionStore = new SessionStore({ ttl: sessionMaxAge });

const app = express();
app.set('trust proxy', 1);

// Middleware setup
app.use(requestLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    name: process.env.SESSION_COOKIE_NAME || '14stars.sid',
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: sessionStore,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: sessionMaxAge
    }
}));
app.use(redirectHtmlRequests);
app.use(express.static(path.join(__dirname, '../public_html')));

app.use('/teachers', teacherRoutes);
app.use('/admins', adminRoutes);
app.use('/parents', parentRoutes);
app.use('/substitute', substituteRoutes);
app.use('/substitute-requests', substituteRequestRoutes);
app.use('/subjects', subjectRoutes);
app.use('/levels', levelRoutes);
app.use('/student-levels', studentLevelRoutes);
app.use('/students', studentRoutes);
app.use('/terms', termRoutes);
app.use(serveExtensionlessHtml);
app.use(errorHandler);

// Start the server only when run directly (helps with tests/reusability)
const PORT = process.env.PORT || 30000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
