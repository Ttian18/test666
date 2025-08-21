import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

// Authentication middleware
export const authenticate = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export { JWT_SECRET };
