import jwt from "jsonwebtoken";
import tokenBlacklistService from "../../services/auth/tokenBlacklistService.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

// Authentication middleware
export const authenticate = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export { JWT_SECRET };
