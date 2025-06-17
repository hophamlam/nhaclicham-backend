// Utility functions for Edge Functions
import { ApiResponse, ErrorResponse } from "./types.ts";

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, message?: string): Response {
  const response: ApiResponse<T> = {
    data,
    ...(message && { message }),
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500
): Response {
  const response: ErrorResponse = {
    error,
    status,
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

/**
 * Handle CORS preflight requests
 */
export function handleCORS(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  return null;
}

/**
 * Parse JSON from request body
 */
export async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    const body = await req.json();
    return body as T;
  } catch (error) {
    throw new Error("Invalid JSON body");
  }
}

/**
 * Get URL path segments
 */
export function getPathSegments(req: Request): string[] {
  const url = new URL(req.url);
  return url.pathname.split("/").filter(Boolean);
}

/**
 * Extract query parameters
 */
export function getQueryParams(req: Request): URLSearchParams {
  const url = new URL(req.url);
  return url.searchParams;
}
