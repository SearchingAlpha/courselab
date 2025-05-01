import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Simply let all requests through without any auth checks
  return NextResponse.next();
}

// Only process specific paths if needed
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/auth/:path*'
  ]
};