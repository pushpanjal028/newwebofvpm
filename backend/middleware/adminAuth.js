import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied: Administrator permissions required" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Admin Auth Error:", err);
    res.status(401).json({ message: "Token validation failed, authorization denied" });
  }
};

export default adminAuth;
