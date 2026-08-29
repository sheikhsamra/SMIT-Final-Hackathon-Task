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
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token, please log in again" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }
};

// Verifies the user has the "admin" role (use after the protect middleware)
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access restricted to admins only" });
};
