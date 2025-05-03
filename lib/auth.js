import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single shared instance of Supabase client for server-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Create a client-side Supabase client that handles auth automatically
 * This creates a fresh client each time, which ensures we're always using
 * the latest auth state from cookies
 */
export function createSupabaseClient() {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

// Debug auth store to see what's happening
export function debugAuthStore() {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log("Auth DEBUG: Local Storage Keys:", Object.keys(localStorage).filter(k => k.includes('auth')));
    const storageData = localStorage.getItem('courseforge-auth-storage');
    if (storageData) {
      console.log("Auth DEBUG: Storage exists:", !!storageData);
      try {
        const parsed = JSON.parse(storageData);
        console.log("Auth DEBUG: Parsed data:", {
          hasSession: !!parsed.session,
          hasExpiresAt: !!parsed.expiresAt,
        });
      } catch (e) {
        console.log("Auth DEBUG: Failed to parse storage data");
      }
    } else {
      console.log("Auth DEBUG: No storage data found");
    }
  } catch (e) {
    console.error("Auth DEBUG: Error accessing storage", e);
  }
}

/**
 * Quick check if we have an auth state cookie (not secure, just for UI purposes)
 * @returns {boolean} True if the auth cookie exists
 */
export function hasAuthCookie() {
  if (typeof document === 'undefined') return false;
  
  return document.cookie.split(';').some(c => {
    return c.trim().startsWith('sb-auth-state=');
  });
}

/**
 * Get the current session
 * @returns {Promise<Object|null>} The current session or null if no session
 */
export async function getSession() {
  try {
    const client = createSupabaseClient();
    const { data, error } = await client.auth.getSession();
    
    if (error) {
      console.error("Auth: Error getting session:", error.message);
      return null;
    }
    
    return data.session;
  } catch (error) {
    console.error('Auth: Error getting session:', error);
    return null;
  }
}

/**
 * Get the current user
 * @returns {Promise<Object|null>} The current user or null if not authenticated
 */
export async function getUser() {
  try {
    const client = createSupabaseClient();
    const { data, error } = await client.auth.getUser();
    
    if (error) {
      console.error("Auth: Error getting user:", error.message);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Auth: Error getting user:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<{user: Object, session: Object}|null>} The user and session objects or null if error
 */
export async function signIn(email, password) {
  try {
    const client = createSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Auth: Sign in error:", error.message);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Auth: Sign in error:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 * @param {boolean} redirect - Whether to redirect after sign out
 * @returns {Promise<void>}
 */
export async function signOut(redirect = true) {
  try {
    const client = createSupabaseClient();
    await client.auth.signOut();
    
    if (redirect && typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
  } catch (error) {
    console.error('Auth: Error signing out:', error);
    throw error;
  }
}

/**
 * Require authentication or redirect
 * For server components/API routes
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }
  return { props: { session } };
} 