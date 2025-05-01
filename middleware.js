import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/auth/signin' || 
                      path === '/auth/signup' ||
                      path === '/auth/error' ||
                      path === '/auth/verify-request';
  
  // Get the session from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;
  
  if (!accessToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  if (accessToken && (path === '/auth/signin' || path === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
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