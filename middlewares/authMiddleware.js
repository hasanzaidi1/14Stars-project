const isAuthenticated = (req, res, next) => {
    if (req.session.isAdmin || req.session.isLoggedIn || req.cookies.username) {
        return next();
    }
    res.status(401).json({ message: 'Authentication required' });
};

const isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        return next();
    }
    res.status(403).json({ message: 'Admin access required' });
};

const isTeacher = (req, res, next) => {
    if (req.session.isTeacher) {
        return next();
    }
    res.status(403).json({ message: 'Teacher access required' });
};

const isParent = (req, res, next) => {
    if (req.session.isParent) {
        return next();
    }
    res.status(403).json({ message: 'Parent access required' });
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isTeacher,
    isParent
};