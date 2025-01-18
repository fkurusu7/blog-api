import jwt from "jsonwebtoken";
import { createError } from "../utils/errorHandler.js";
import { info, warn } from "../utils/logger.js";

export const verifyToken = (req, res, next) => {
  info(req.cookies.user_token);
  const token = req.cookies?.user_token;
  warn(`Token: ${token}`);

  // Verify there is a token, if not error 401
  if (!token) {
    info("NO TOKEN");
    return next(createError(401, "Unauthorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      info("NO TOKEN 2");
      return next(createError(401, "Unauthorized"));
    }

    // IF valid, add user from token to the request
    req.user = decoded;
    next();
  });
};
