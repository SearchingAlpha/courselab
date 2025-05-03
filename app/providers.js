'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Providers({ children }) {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'courseforge-auth-storage',
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') return null;
            return window.localStorage.getItem(key);
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') return;
            window.localStorage.setItem(key, value);
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') return;
            window.localStorage.removeItem(key);
          },
        },
      },
      global: {
        headers: { 'X-Client-Info': 'nextjs' },
      },
    }
  ));
  const router = useRouter();

  // Handle auth state change
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Delete cookies on sign out
        const expires = new Date(0).toUTCString();
        document.cookie = `sb-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
        document.cookie = `sb-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
        router.refresh();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Cross-tab synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Function to handle storage changes
    const handleStorageChange = (e) => {
      // Only react to our auth storage changes
      if (e.key === 'courseforge-auth-storage') {
        // Force refresh the session from localStorage
        supabase.auth.getSession().then(({ data }) => {
          // If session exists in other tab but not in current tab, refresh the page
          if (data?.session) {
            router.refresh();
          } else if (!data?.session) {
            // If session was removed in other tab but still exists in current tab, refresh
            router.refresh();
          }
        });
      }
    };

    // Add storage event listener for cross-tab communication
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [supabase, router]);

  return children;
}