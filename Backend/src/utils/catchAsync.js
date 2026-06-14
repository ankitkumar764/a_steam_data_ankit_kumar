/**
 * Wraps an async express route handler and forwards errors to the next middleware
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped express middleware
 */
module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
