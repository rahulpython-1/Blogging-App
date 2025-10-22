// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response helper
export const sendErrorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message
  };

  // Add error details in development
  if (process.env.NODE_ENV !== 'production' && error) {
    response.error = error.message;
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};
