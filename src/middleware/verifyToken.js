import jwt from "jsonwebtoken";
import { createError } from "../utils/errorHandler.js";
import { info, warn } from "../utils/logger.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.user_token;

  // Verify there is a token, if not error 401
  if (!token) {
    return next(createError(401, "Unauthorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return next(createError(401, "Unauthorized"));
    }

    // IF valid, add user from token to the request
    req.user = decoded;
    next();
  });
};
