/**
 * Custom Error Classes for API Handling
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequest extends AppError {
  constructor(message: string, code?: string) {
    super(400, message, code || 'BAD_REQUEST');
  }
}

export class Unauthorized extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(401, message, code || 'UNAUTHORIZED');
  }
}

export class Forbidden extends AppError {
  constructor(message: string = 'Access denied', code?: string) {
    super(403, message, code || 'FORBIDDEN');
  }
}

export class NotFound extends AppError {
  constructor(resource: string, code?: string) {
    super(404, `${resource} not found`, code || 'NOT_FOUND');
  }
}

export class Conflict extends AppError {
  constructor(message: string, code?: string) {
    super(409, message, code || 'CONFLICT');
  }
}

export class RateLimited extends AppError {
  constructor(
    public retryAfter: number,
    message: string = 'Too many requests',
    code?: string
  ) {
    super(429, message, code || 'RATE_LIMITED');
  }
}

export class InsufficientCredits extends AppError {
  constructor(required: number, available: number) {
    super(
      402,
      `Insufficient credits. Required: ${required}, Available: ${available}`,
      'INSUFFICIENT_CREDITS'
    );
  }
}

export class InvalidPayment extends AppError {
  constructor(message: string = 'Payment verification failed', code?: string) {
    super(402, message, code || 'INVALID_PAYMENT');
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(500, message, code || 'INTERNAL_SERVER_ERROR');
  }
}

/**
 * Error handler middleware
 */
export function handleError(error: unknown): { statusCode: number; message: string; code?: string } {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    };
  }

  return {
    statusCode: 500,
    message: 'Unknown error occurred',
  };
}
