const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); // Import cookie-parser
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
app.post('/register', isAuthenticated, (req, res) => {
    const { 
        fname, 
        lname, 
        age, 
        grade, 
        gender, 
        parent_name, 
        parent_contact 
    } = req.body;

    // Log the student information
    console.log(`
        Student First Name: ${fname}, 
        Student Last Name: ${lname}, 
        Age: ${age}, 
        Grade: ${grade}, 
        Gender: ${gender}, 
        Parent Name: ${parent_name.join(", ")}, 
        Parent Contacts: ${parent_contact.join(", ")}`);

    // Save the student data, including multiple parent contacts, to the database
    res.json({ message: 'Student registered successfully!' });
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
