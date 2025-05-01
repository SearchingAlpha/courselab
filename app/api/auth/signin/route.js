import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log('API: Sign in attempt for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('API: Session error:', sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 400 });
    }

    if (!session) {
      console.error('API: No session created');
      return NextResponse.json({ error: 'No session created' }, { status: 400 });
    }

    console.log('API: Session created successfully, setting cookies');
    // Set the session cookie
    const response = NextResponse.json({ user: data.user });
    
    // Set the auth cookie
    response.cookies.set({
      name: 'sb-access-token',
      value: session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    response.cookies.set({
      name: 'sb-refresh-token',
      value: session.refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

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