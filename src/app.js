const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
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


const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public_html')));
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('/teachers', teacherRoutes);
app.use('/admins', adminRoutes);
app.use('/parents', parentRoutes);
app.use('/substitute', substituteRoutes);
app.use('/substitute-requests', substituteRequestRoutes);
app.use('/subjects', subjectRoutes);
app.use('/levels', levelRoutes);
app.use('/student-levels', studentLevelRoutes);
app.use('/students', studentRoutes)
app.use('/terms', termRoutes);

// Start the server only when run directly (helps with tests/reusability)
const PORT = process.env.PORT || 30000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
