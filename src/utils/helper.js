export const setupRequestTimeout = (req, res, next, timeout = 30000) => {
  res.setTimeout(timeout, () => {
    next(createError(408, "Request timed out - please try again"));
  });
};
