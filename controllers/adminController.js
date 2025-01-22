const path = require('path');

class AdminController {
    async login(req, res) {
        const { username, password, remember } = req.body;
        const adminUser = {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
        };

        if (username === adminUser.username && password === adminUser.password) {
            req.session.isAdmin = true;
            if (remember) {
                res.cookie('username', username, { 
                    maxAge: 30 * 24 * 60 * 60 * 1000 
                });
            }
            res.redirect('/admin/admin.html');
        } else {
            return res.status(401).sendFile(path.join(__dirname, '../public_html/invalid-credentials.html'));
        }
    }

    async logout(req, res) {
        if (req.session) {
            req.session.destroy(err => {
                if (err) {
                    res.status(500).send('Failed to log out');
                } else {
                    res.clearCookie('connect.sid');
                    res.redirect('/admin/admin-login.html'); // Redirect to login page
                }
            });
        } else {
            res.redirect('/admin/admin-login.html'); // No session, go to login
        }
    }
}


module.exports = new AdminController();
