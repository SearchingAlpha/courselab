// app/api/waitlist/route.js
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // First check if email already exists
    const { data: existingEntry, error: checkError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing email:', checkError)
      throw checkError
    }

    if (existingEntry) {
      return new Response(JSON.stringify({ message: 'Email already exists in waitlist' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Insert new entry
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email }])
      .select()
      .single()

    if (error) {
      console.error('Error inserting into waitlist:', error)
      throw error
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in waitlist POST:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to add to waitlist',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}