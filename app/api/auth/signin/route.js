import { supabase as authSupabase } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log('API: Sign in attempt for:', email);

    // Try to sign out any existing session first to ensure clean state
    try {
      await authSupabase.auth.signOut({ scope: 'local' });
      console.log('API: Cleared any existing session before signing in');
    } catch (error) {
      console.log('API: No existing session to clear or error clearing:', error.message);
      // Continue with sign in regardless of any error here
    }

    // Attempt to sign in with the provided credentials
    const { data, error } = await authSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('API: Supabase sign in error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data?.user) {
      console.error('API: No user data received from Supabase');
      return NextResponse.json({ error: 'No user data received' }, { status: 400 });
    }

    console.log('API: User authenticated successfully:', data.user.id);

    // Get the session
    const session = data.session;
    
    if (!session) {
      console.error('API: No session created');
      return NextResponse.json({ error: 'No session created' }, { status: 400 });
    }

    console.log('API: Session created successfully, setting cookies');
    
    // Create response object
    const response = NextResponse.json({ 
      user: data.user, 
      success: true,
      session: {
        access_token: session.access_token,
        expires_at: session.expires_at
      }
    });
    
    // Set the auth cookies with proper settings
    response.cookies.set({
      name: 'sb-access-token',
      value: session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    response.cookies.set({
      name: 'sb-refresh-token',
      value: session.refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Also set a non-HttpOnly cookie for client-side session check
    response.cookies.set({
      name: 'sb-auth-state',
      value: 'true',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // After successful sign-in, ensure user exists in the database
    const authUser = data.user;
    
    // Check if user already exists in database
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();
    
    // If user doesn't exist, create them
    if (!existingUser) {
      console.log('User authenticated but not found in database, creating record:', authUser.id);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id, // Use the same ID from auth
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email_verified: authUser.email_confirmed_at
        }]);
      
      if (insertError) {
        console.error('Error creating user in database:', insertError);
        // Continue anyway, as auth was successful
      }
    }

    console.log('API: Sign in process completed successfully');
    return response;
  } catch (error) {
    console.error('API: Sign in error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    );
  }
} 