export const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const notFound = (req, res, next) => next(createError(404, "Not Found"));

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  // Log error for debugging
  console.error(`[Error] ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export default errorHandler;
