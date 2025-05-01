'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Providers({ children }) {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ));
  const router = useRouter();

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

  return children;
}