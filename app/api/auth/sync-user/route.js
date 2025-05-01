import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * API endpoint to synchronize a Supabase Auth user with the database users table
 * This creates or updates a user record in the users table based on the auth user
 */
export async function POST(request) {
  try {
    // Get the current authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('Error getting authenticated user:', authError);
      return NextResponse.json(
        { error: 'Authentication required', details: 'No authenticated user found' },
        { status: 401 }
      );
    }
    
    const authUser = authData.user;
    console.log('Syncing user:', authUser.id);
    
    // Check if user already exists in the database
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();
    
    // If user doesn't exist, create them
    if (!existingUser) {
      console.log('User not found in database, creating new record');
      
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id, // Use the same ID from auth
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email_verified: authUser.email_confirmed_at
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating user in database:', insertError);
        return NextResponse.json(
          { error: 'Failed to sync user', details: insertError.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ user: insertedUser, created: true }, { status: 201 });
    }
    
    // User exists, just return success
    return NextResponse.json({ user: existingUser, synced: true }, { status: 200 });
    
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    );
  }
} 