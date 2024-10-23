import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Log to verify middleware is running
console.log('Middleware initialized');

export function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.url);
  
  const origin = request.headers.get('origin');
  console.log('Request origin:', origin);

  // For development, allow localhost
  const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];
  const isAllowedOrigin = origin ? allowedOrigins.includes(origin) : false;

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin! : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Handle actual requests
  console.log('Handling regular request');
  const response = NextResponse.next();
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin! : '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// Verify matcher is correct
export const config = {
  matcher: '/api/:path*',
};