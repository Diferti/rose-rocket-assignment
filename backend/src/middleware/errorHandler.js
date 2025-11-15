/**
 * Global error handling middleware
 */

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: 'A record with this information already exists',
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      error: 'Invalid reference',
      message: 'Referenced record does not exist',
    });
  }

  if (err.code === '23502') { // Not null violation
    return res.status(400).json({
      success: false,
      error: 'Missing required field',
      message: err.message,
    });
  }

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: err.message,
      errors: err.errors,
    });
  }

  // Geocoding errors
  if (err.type === 'geocoding') {
    return res.status(400).json({
      success: false,
      error: 'Geocoding error',
      message: err.message,
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name || 'Error',
      message: err.message,
    });
  }

  // Default 500 server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
};

