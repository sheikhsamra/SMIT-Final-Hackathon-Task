import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Yeh middleware check karta hai ke request ke saath valid token hai ya nahi
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token invalid ya expire ho gaya, dubara login karein" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Access denied, token nahi mila" });
  }
};

// Yeh middleware check karta hai ke user "admin" hai ya nahi (protect ke baad lagana hai)
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Sirf admin ke liye ijazat hai" });
};
