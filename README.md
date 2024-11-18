```
14Stars-project/
├── config/                     # Configuration files
│   └── dbConfig.js             # Database configuration
├── controllers/                # Route controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── parentController.js
│   ├── studentController.js
│   ├── substituteController.js
│   ├── teacherController.js
│   └── subjectController.js
├── middlewares/                # Custom middleware functions
│   └── authMiddleware.js
├── models/                     # Database models
│   ├── adminModel.js
│   ├── parentModel.js
│   ├── studentModel.js
│   ├── substituteModel.js
│   ├── teacherModel.js
│   └── subjectModel.js
├── routes/                     # Express route definitions
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── parentRoutes.js
│   ├── studentRoutes.js
│   ├── substituteRoutes.js
│   ├── teacherRoutes.js
│   └── subjectRoutes.js
├── public/                     # Static files (CSS, JS, HTML)
│   ├── css/
│   ├── js/
│   └── html/
├── tests/                      # Test files (optional)
│   ├── auth.test.js
│   ├── student.test.js
│   └── teacher.test.js
├── utils/                      # Utility functions (optional)
│   └── helpers.js              # Helper functions used across the app
├── .env                        # Environment variables
├── app.js                      # Main application file
└── package.json                # Project metadata and dependencies
```

1. config/dbConfig.js

```
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
```

2. controllers/authController.js
```
const bcrypt = require('bcrypt');
const pool = require('../config/dbConfig');

const authController = {
    login: async (req, res) => {
        const { username, password } = req.body;
        // Implement your login logic here
        // Example: Check if user exists and compare passwords
    },
    
    register: async (req, res) => {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert user into database
    }
};

module.exports = authController;
```

3. controllers/studentController.js
```
const pool = require('../config/dbConfig');

const studentController = {
    register: async (req, res) => {
        const { fname, lname, email } = req.body;
        // Implement student registration logic
    },
    
    fetchAll: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM student');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching students:', error);
            res.status(500).send('Server Error');
        }
    }
};

module.exports = studentController;
```

4. middlewares/authMiddleware.js
```
const authMiddleware = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    return res.status(401).send('Unauthorized');
};

module.exports = authMiddleware;
```

5. models/studentModel.js
```
const pool = require('../config/dbConfig');

const studentModel = {
    create: async (studentData) => {
        const { fname, lname, email } = studentData;
        const [result] = await pool.query(
            'INSERT INTO student (F_Name, L_Name, Email) VALUES (?, ?, ?)',
            [fname, lname, email]
        );
        return result;
    },
    
    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM student');
        return rows;
    }
};

module.exports = studentModel;
```

6. routes/authRoutes.js
```
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
```

7. routes/studentRoutes.js
```
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authMiddleware, studentController.register);
router.get('/all', authMiddleware, studentController.fetchAll);

module.exports = router;
```

8. app.js
```
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

9. utils/helpers.js (optional)
```
const formatResponse = (data, message) => {
    return {
        success: true,
        message: message || 'Operation successful',
        data: data
    };
};

module.exports = {
    formatResponse
};
```
