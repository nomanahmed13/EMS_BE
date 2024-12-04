const authenticateUser = (req, res, next) => {
    const user = req.user; // Assuming `req.user` is populated by auth middleware
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = user._id;
    req.userEmail = user.email; // Populate `req.userEmail`
    next();
};

module.exports = authenticateUser;
