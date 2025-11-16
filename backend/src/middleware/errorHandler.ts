import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function parseValidationError(errorMessage: string): AppError {
  if (errorMessage.startsWith('INVALID_INPUT:')) {
    return new AppError(errorMessage.replace('INVALID_INPUT: ', ''), 400);
  }
  if (errorMessage.startsWith('EMPTY_INPUT:')) {
    return new AppError(errorMessage.replace('EMPTY_INPUT: ', ''), 400);
  }
  if (errorMessage.startsWith('MISSING_FIELD:')) {
    return new AppError(errorMessage.replace('MISSING_FIELD: ', ''), 400);
  }
  return new AppError(errorMessage, 400);
}

export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode
    });
  }

  // Database errors
  if (err.message.includes('SQLITE') || err.message.includes('database')) {
    return res.status(500).json({
      error: 'Database error occurred',
      statusCode: 500
    });
  }

  // Default to 500 for unknown errors
  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500
  });
}
