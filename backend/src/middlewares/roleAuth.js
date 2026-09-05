import User from "../models/User.js";

/**
 * Middleware to check if the admin has one of the allowed roles.
 * Must be used AFTER adminAuth middleware.
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route.
 */
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // req.user should be populated by adminAuth

      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Access denied: Administrator permissions required" });
      }

      // Super admin has full access to everything
      if (user.adminRole === "super_admin") {
        return next();
      }

      // Check if the user's role is in the allowed roles
      if (allowedRoles.includes(user.adminRole)) {
        return next();
      }

      return res.status(403).json({ message: "Access denied: Insufficient role permissions" });
    } catch (err) {
      console.error("❌ Role Auth Error:", err);
      res.status(500).json({ message: "Server error during role authorization" });
    }
  };
};

export default requireRole;
