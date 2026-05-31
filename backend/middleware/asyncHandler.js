/**
 * Wraps async route handlers to catch errors and pass to Express error handler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
