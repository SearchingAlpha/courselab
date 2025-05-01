import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single shared instance of Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Don't automatically parse URL fragments
    // Use a unique storage key to avoid conflicts
    storageKey: 'courseforge-auth-storage',
  },
});

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
 * Get the current session directly from storage first, then try API
 * @returns {Promise<Object|null>} The current session or null if no session
 */
export async function getSession() {
  try {
    debugAuthStore();
    console.log("Auth: Getting session...");
    
    // First check the client-side cookie for quick auth state
    if (!hasAuthCookie() && typeof window !== 'undefined') {
      console.log("Auth: No auth cookie found, skipping session check");
      return null;
    }
    
    // Get session from Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Auth: Error getting session:", error.message);
      return null;
    }
    
    const session = data?.session;
    console.log("Auth: Session result:", session ? "Session found" : "No session");
    
    if (session) {
      // Verify session is still valid
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        console.log("Auth: Session expired, clearing");
        await supabase.auth.signOut({ scope: 'local' });
        return null;
      }
    }
    
    return session;
  } catch (error) {
    console.error('Auth: Error getting session:', error);
    return null;
  }
}

/**
 * Get the current user with a session check
 * @returns {Promise<Object|null>} The current user or null if not authenticated
 */
export async function getUser() {
  try {
    console.log("Auth: Getting user...");
    
    // First make sure we have a valid session
    const session = await getSession();
    if (!session) {
      console.log("Auth: No active session found for user");
      return null;
    }
    
    // Get the user data from supabase
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Auth: Error getting user:", error.message);
      return null;
    }
    
    console.log("Auth: User result:", data.user ? "User found" : "No user");
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
    console.log("Auth: Signing in with email:", email);
    
    // First sign out any existing session
    await signOut(false); // Don't redirect
    
    // Sign in with credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Auth: Sign in error:", error.message);
      throw new Error(error.message);
    }
    
    if (!data.user || !data.session) {
      console.error("Auth: Sign in succeeded but no user or session returned");
      throw new Error("Authentication failed");
    }
    
    console.log("Auth: Sign in successful for user:", data.user.email);
    
    // Set the auth state cookie
    document.cookie = `sb-auth-state=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; secure`;
    
    return data;
  } catch (error) {
    console.error("Auth: Sign in error:", error);
    throw error;
  }
}

/**
 * Sign out the current user and clear session data
 * @param {boolean} redirect - Whether to redirect after sign out
 * @returns {Promise<void>}
 */
export async function signOut(redirect = true) {
  try {
    console.log("Auth: Signing out...");
    
    // Sign out from Supabase
    await supabase.auth.signOut({ scope: 'global' });
    
    // Clear all cookies
    const expires = new Date(0).toUTCString();
    document.cookie = `sb-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
    document.cookie = `sb-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
    document.cookie = `sb-auth-state=; path=/; expires=${expires}; SameSite=Lax; secure`;
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('courseforge-auth-storage');
      // Clear any other supabase-related items
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    console.log("Auth: Sign out successful");
    
    if (redirect) {
      window.location.href = '/auth/signin';
    }
  } catch (error) {
    console.error('Auth: Error signing out:', error);
    
    if (redirect) {
      window.location.href = '/auth/signin';
    }
    
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