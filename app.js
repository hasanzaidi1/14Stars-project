const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const { Pool } = require('pg'); // Import pg library for PostgreSQL
const app = express();

require('dotenv').config();

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files like HTML/CSS/JS
app.use(express.static('public'));

// Cookie parser middleware
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: 'your_secret_key',  // Replace with a more secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // For production, set 'secure: true' if using HTTPS
}));

// PostgreSQL connection setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Dummy admin credentials (replace with a database lookup in production)
const adminUser = {
    username: process.env.user,
    password: process.env.pass
};

// Middleware to check if the user is logged in as admin
function isAuthenticated(req, res, next) {
    console.log('Session:', req.session); // Log session details
    console.log('Cookies:', req.cookies); // Log cookie details

    if (req.session.isAdmin || req.cookies.username) {
        return next();
    } else {
        console.log('Not authenticated, redirecting to login.'); // Log redirect action
        res.redirect('/login');  // Redirect to login if not authenticated
    }
}

// Admin login route
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/admin-login.html');  // Serve admin login.html
});

app.post('/login', (req, res) => {
    const { username, password, remember } = req.body;

    // Check if credentials match
    if (username === adminUser.username && password === adminUser.password) {
        req.session.isAdmin = true;  // Set the session to indicate admin is logged in
        console.log('Admin logged in. Session:', req.session); // Log session details after login

        if (remember) {
            // Set a cookie for 30 days if "Remember Me" is checked
            res.cookie('username', username, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
        }

        res.redirect('/admin.html');  // Redirect to admin.html after successful login
    } else {
        res.send('Invalid credentials. Please try again.');
    }
});

// Serve the students page (Protected route)
app.get('/students', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/students.html');  // Serve students.html file
});

// Student registration route (only admins can access)
app.post('/register', isAuthenticated, async (req, res) => {
    const { 
        fname,
        MI,
        lname,
        DOB,
        st_address,
        city,
        state,
        zip, // Now a text field
        st_email,
        st_cell, // Now a text field
        gender
    } = req.body;

    console.log(`
        Student First Name: ${fname}, 
        Middle Initial: ${MI}, 
        Student Last Name: ${lname}, 
        Date of Birth: ${DOB}, 
        Address: ${st_address}, 
        City: ${city}, 
        State: ${state}, 
        Zip: ${zip}, 
        Email: ${st_email}, 
        Cell: ${st_cell}, 
        Gender: ${gender}`);

    try {
        const query = `
            INSERT INTO student ("F_Name", "MI", "L_Name", dob, "st_address", city, state, zip, "st_email", "st_cell", "st_gender")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        const values = [
            fname,
            MI,
            lname,
            DOB,
            st_address,
            city,
            state,
            zip, // Expecting this as a string now
            st_email,
            st_cell, // Expecting this as a string now
            gender
        ];

        await pool.query(query, values);
        res.json({ message: 'Student registered successfully!' });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.clearCookie('username');  // Clear the username cookie
        res.redirect('/login');
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
