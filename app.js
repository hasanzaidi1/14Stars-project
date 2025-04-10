const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const pool = require('./config/dbConfig'); // Import the database connection pool
const helpers = require('./utils/helpers'); // Import helper functions
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const parentRoutes = require('./routes/parentRoutes');
const subRoutes = require('./routes/substituteRoutes');
const substituteRequestRoutes = require('./routes/substituteRequestRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const levelRoutes = require('./routes/levelRoutes');
const studentLevelRoutes = require('./routes/studentLevelRoutes');
const studentRoutes = require('./routes/studentRoutes');


const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public_html'));
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
app.use('/substitute', subRoutes);
app.use('/substitute-requests', substituteRequestRoutes);
app.use('/subjects', subjectRoutes);
app.use('/levels', levelRoutes);
app.use('/student-levels', studentLevelRoutes);
app.use('/students', studentRoutes)

// Start the server
const PORT = process.env.PORT || 30000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});