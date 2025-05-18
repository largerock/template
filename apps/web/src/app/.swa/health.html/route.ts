import { NextResponse } from 'next/server';

/**
 * Azure Static Web Apps health check endpoint
 * This route returns a 200 OK response to indicate that the application is healthy
 * No authentication is required for this endpoint
 */
export async function GET() {
  return new NextResponse('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
