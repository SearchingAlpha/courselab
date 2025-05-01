import { NextResponse } from 'next/server';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/auth/signin' || 
                      path === '/auth/signup' ||
                      path === '/auth/error' ||
                      path === '/auth/verify-request';
  
  // For auth routes, just proceed (auth checks are handled client-side)
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For dashboard and other protected routes, check for auth cookie
  const authStateCookie = request.cookies.get('sb-auth-state')?.value;
  const accessToken = request.cookies.get('sb-access-token')?.value;
  
  // If no auth cookie, redirect to sign in page
  if (!authStateCookie && !accessToken) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // Otherwise, let the request through
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/auth/:path*'
  ]
};