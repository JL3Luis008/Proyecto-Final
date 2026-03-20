import jwt from "jsonwebtoken";
import RevokedToken from "../models/revokedToken.js";

const authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if token is in denylist
    const isRevoked = await RevokedToken.exists({ token });
    if (isRevoked) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error during authentication" });
  }
};

export default authMiddleware;
