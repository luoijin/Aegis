const sessionTimeout = 30 * 60 * 1000; // 30 minutes

const checkSessionTimeout = async (req, res, next) => {
  const user = req.user;
  if (user && user.lastLogin) {
    const timeSinceLastActivity = Date.now() - new Date(user.lastLogin).getTime();
    if (timeSinceLastActivity > sessionTimeout) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }
  }
  next();
};

module.exports = { checkSessionTimeout };