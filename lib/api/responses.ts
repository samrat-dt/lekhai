/**
 * Standardized API Response Utilities
 * Consistent response formatting across all endpoints
 */

import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  statusCode: number;
}

/**
 * Success Response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Request successful',
      timestamp: new Date().toISOString(),
      statusCode,
    },
    { status: statusCode }
  );
}

/**
 * Error Response
 */
export function errorResponse(
  error: string,
  statusCode: number = 400,
  message?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      message: message || 'Request failed',
      timestamp: new Date().toISOString(),
      statusCode,
    },
    { status: statusCode }
  );
}

/**
 * 400 Bad Request
 */
export function badRequest(error: string, message?: string): NextResponse<ApiResponse> {
  return errorResponse(error, 400, message || 'Bad request');
}

/**
 * 401 Unauthorized
 */
export function unauthorized(message?: string): NextResponse<ApiResponse> {
  return errorResponse('Unauthorized', 401, message || 'Authentication required');
}

/**
 * 403 Forbidden
 */
export function forbidden(message?: string): NextResponse<ApiResponse> {
  return errorResponse('Forbidden', 403, message || 'Access denied');
}

/**
 * 404 Not Found
 */
export function notFound(resource: string): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404);
}

/**
 * 429 Too Many Requests
 */
export function rateLimited(message?: string): NextResponse<ApiResponse> {
  return errorResponse('Rate limited', 429, message || 'Too many requests');
}

/**
 * 500 Internal Server Error
 */
export function serverError(error: Error | string): NextResponse<ApiResponse> {
  const message = typeof error === 'string' ? error : error.message;
  console.error('Server error:', error);
  return errorResponse(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    500
  );
}

/**
 * List Response with Pagination
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  limit: number,
  offset: number,
  statusCode: number = 200
): NextResponse<
  ApiResponse<{
    items: T[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      pages: number;
      currentPage: number;
    };
  }>
> {
  const pages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return successResponse(
    {
      items,
      pagination: {
        total,
        limit,
        offset,
        pages,
        currentPage,
      },
    },
    'List retrieved successfully',
    statusCode
  );
}
