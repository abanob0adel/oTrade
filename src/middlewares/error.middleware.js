/**
 * Global Error Handling Middleware
 * Handles all application errors consistently
 */

/**
 * Global error handler for the entire application
 */
export const globalErrorHandler = (error, req, res, next) => {
  // Log error with comprehensive context
  console.error('\n=== GLOBAL ERROR HANDLER ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Method:', req.method);
  console.error('URL:', req.url);
  console.error('IP:', req.ip);
  console.error('User-Agent:', req.get('User-Agent'));
  console.error('User ID:', req.auth?.id || req.user?.id || 'Anonymous');
  console.error('Role:', req.auth?.role || req.user?.role || 'Unknown');
  console.error('Error Details:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    errorCode: error.errorCode
  });
  
  // Handle different error types
  if (error.name === 'ValidationError') {
    // Mongoose validation errors
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationErrors,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (error.name === 'CastError') {
    // Mongoose cast errors (invalid ObjectId)
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format provided',
        timestamp: new Date().toISOString()
      }
    });
  }

  if (error.code === 11000) {
    // MongoDB duplicate key errors
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: `${field} already exists`,
        field: field,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (error.name === 'JsonWebTokenError') {
    // JWT errors
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
        timestamp: new Date().toISOString()
      }
    });
  }

  if (error.name === 'TokenExpiredError') {
    // Expired JWT
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired',
        timestamp: new Date().toISOString()
      }
    });
  }

  if (error.name === 'UnauthorizedError') {
    // Express-jwt unauthorized errors
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access denied - invalid credentials',
        timestamp: new Date().toISOString()
      }
    });
  }

  if (error.code === 'ENOENT' || error.code === 'EACCES') {
    // File system errors
    return res.status(500).json({
      success: false,
      error: {
        code: 'FILE_SYSTEM_ERROR',
        message: 'File operation failed',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle custom application errors (BookError, etc.)
  if (error.statusCode && error.errorCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        ...(error.field && { field: error.field }),
        ...(error.details && { details: error.details }),
        timestamp: new Date().toISOString()
      }
    });
  }

  // Default 500 error for unhandled errors
  console.error('UNHANDLED ERROR:', error);
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error occurred' 
        : error.message,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * 404 Handler for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Async error wrapper for Express routes
 * Catches async errors and passes them to the error handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Development error logger
 * Shows detailed error information in development
 */
export const developmentErrorLogger = (error, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('\n=== DEVELOPMENT ERROR DETAILS ===');
    console.error('Error:', error);
    console.error('Request Body:', req.body);
    console.error('Request Params:', req.params);
    console.error('Request Query:', req.query);
    console.error('==================================\n');
  }
  next(error);
};