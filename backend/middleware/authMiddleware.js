import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies that the request carries a valid JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Your session is no longer valid, please log in again" });
      }
      if (req.user.isBlocked) {
        return res.status(401).json({ message: "Your account has been blocked. Contact support if you think this is a mistake." });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token, please log in again" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }
};

// Restricts a route to the given roles, e.g. restrictTo("worker", "admin") (use after the protect middleware)
export const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (req.user && allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: "You do not have permission to perform this action" });
};
