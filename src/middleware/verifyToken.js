import jwt from "jsonwebtoken";
import { createError } from "../utils/errorHandler.js";
import { info } from "../utils/logger.js";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.user_token;

    info(`Token: ${token}`);
    // Verify there is a token, if not error 401
    if (!token) {
      return next(createError(401, "Access denied. Not authorized."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // If used as middleware, proceed to next function
    if (next) next();

    // if used as a standalone function
    return true;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token expired. Please login again."));
    }
    // if (error.name === "JsonWebTokenError")
    // For any other errors
    return next(createError(401, "Invalid Token. Please login again."));
  }
};
