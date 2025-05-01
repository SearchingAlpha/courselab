import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Create a corresponding record in the database users table
    if (data && data.user) {
      const authUser = data.user;
      
      console.log('Creating database record for new user:', authUser.id);
      
      // Insert the user into the users table with the same ID
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: authUser.email,
          name: name || authUser.email?.split('@')[0] || 'User',
          email_verified: authUser.email_confirmed_at
        }]);
      
      if (insertError) {
        console.error('Error creating user in database:', insertError);
        // Continue anyway as the auth user was created successfully
      }
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 500 }
    );
  }
} 