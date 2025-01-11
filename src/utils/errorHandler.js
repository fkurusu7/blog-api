import { error as logError } from "./logger.js";

export const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const notFound = (req, res, next) =>
  next(createError(404, "Path Not Found"));

// Fields Validation handleError
export const handleZodError = (error, next) => {
  const errorMessage = error.errors.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
  return next(createError(400, JSON.stringify(errorMessage)));
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  if (statusCode !== 404) {
    logError(`${statusCode}: ${message}`, error);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export default errorHandler;
