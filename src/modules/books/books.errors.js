/**
 * Custom error classes for Books module
 */

export class BookError extends Error {
  constructor(message, statusCode = 500, errorCode = 'BOOK_ERROR') {
    super(message);
    this.name = 'BookError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BookError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class NotFoundError extends BookError {
  constructor(message = 'Book not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends BookError {
  constructor(message = 'Unauthorized access') {
    super(message, 403, 'UNAUTHORIZED');
  }
}

export class FileUploadError extends BookError {
  constructor(message) {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

export class TranslationError extends BookError {
  constructor(message) {
    super(message, 400, 'TRANSLATION_ERROR');
  }
}

/**
 * Helper function to create consistent error responses
 */
export const createErrorResponse = (error) => {
  const response = {
    success: false,
    error: {
      code: error.errorCode || 'UNKNOWN_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    }
  };

  if (error.details) {
    response.error.details = error.details;
  }

  if (error.field) {
    response.error.field = error.field;
  }

  return response;
};