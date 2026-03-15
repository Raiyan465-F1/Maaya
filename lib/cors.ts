import type { NextResponse } from "next/server";

const allowedOrigins =
  process.env.NEXTAUTH_URL || process.env.CORS_ORIGIN
    ? [process.env.NEXTAUTH_URL!, process.env.CORS_ORIGIN!].filter(Boolean)
    : ["http://localhost:3000"];

export function withCorsHeaders(origin: string | null): Record<string, string> {
  const allowOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function mergeCorsIntoResponse(
  response: NextResponse,
  origin: string | null
): NextResponse {
  const headers = withCorsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
