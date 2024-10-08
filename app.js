const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle student registration
app.post('/register', (req, res) => {
    const { 
        fname, 
        lname, 
        age, 
        grade, 
        gender, 
        parent_name_f, 
        parent_name_l, 
        parent_contact 
    } = req.body;

    // Log the student information
    console.log(`
        Student First Name: ${fname}, 
        Student Last Name: ${lname}, 
        Age: ${age}, 
        Grade: ${grade}, 
        Gender: ${gender}, 
        Parent First Names: ${parent_name_f.join(", ")}, 
        Parent Last Names: ${parent_name_l.join(", ")},
        Parent Contacts: ${parent_contact.join(", ")}`);

    // Save the student data, including multiple parent contacts, to the database
    res.json({ message: 'Student registered successfully!' });
});

// Serve static files like HTML/CSS/JS
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
