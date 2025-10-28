// middleware/adminMiddleware.js
const verifyAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by authenticateToken middleware)
    if (!req.user) {
      console.log('Admin Middleware - No user found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Admin Middleware - Checking admin status for:', req.user.username, 'isAdmin:', req.user.isAdmin);

    // Check if user has admin privileges
    if (!req.user.isAdmin) {
      console.log('Admin Middleware - Access denied for non-admin user:', req.user.username);
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.',
        isAdmin: false 
      });
    }

    console.log('Admin Middleware - Admin access granted for:', req.user.username);
    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ message: 'Server error during admin verification' });
  }
};

module.exports = verifyAdmin;