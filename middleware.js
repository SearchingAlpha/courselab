import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  try {
    // Create a response to modify
    const res = NextResponse.next();
    
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req: request, res });
    
    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession();
    
    // If accessing a protected route and not authenticated, redirect to login
    const protectedPathPrefixes = ['/dashboard'];
    const isProtectedPath = protectedPathPrefixes.some(prefix => 
      request.nextUrl.pathname.startsWith(prefix)
    );
    
    if (isProtectedPath && !session) {
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    return res;
  } catch (e) {
    console.error('Auth middleware error:', e);
    return NextResponse.next();
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