import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  try {
    // Create a response to modify
    const res = NextResponse.next();
    
    // Create a Supabase client configured to use cookies with consistent options
    const supabase = createMiddlewareClient({ 
      req: request, 
      res,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          flowType: 'pkce',
          storageKey: 'courseforge-auth-storage',
        },
        global: {
          headers: { 'X-Client-Info': 'middleware' },
        },
      }
    });
    
    // Always try to refresh the session first
    const { data } = await supabase.auth.getSession();
    
    // If accessing a protected route and not authenticated, redirect to login
    const protectedPathPrefixes = ['/dashboard'];
    const isProtectedPath = protectedPathPrefixes.some(prefix => 
      request.nextUrl.pathname.startsWith(prefix)
    );
    
    // Only check session for protected paths to avoid unnecessary redirects
    if (isProtectedPath) {
      if (!data?.session) {
        // Add cache control headers to prevent caching of redirects
        const redirectUrl = new URL('/auth/signin', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        const redirectRes = NextResponse.redirect(redirectUrl);
        
        // Add cache control headers to prevent caching the redirect
        redirectRes.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        redirectRes.headers.set('Pragma', 'no-cache');
        redirectRes.headers.set('Expires', '0');
        
        return redirectRes;
      }
    }
    
    // Add cache control headers for auth-related responses
    // This prevents browsers from caching auth state
    if (request.nextUrl.pathname.startsWith('/auth') || isProtectedPath) {
      res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');
    }
    
    return res;
  } catch (e) {
    console.error('Auth middleware error:', e);
    // Add debugging information to the response headers in development
    const res = NextResponse.next();
    if (process.env.NODE_ENV !== 'production') {
      res.headers.set('X-Auth-Error', e.message);
    }
    return res;
  }
}

// Specify which routes this middleware should run for
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/auth/:path*'
  ]
};