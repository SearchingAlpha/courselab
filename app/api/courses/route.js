import { supabase } from '@/lib/auth'

/**
 * GET handler for listing courses
 * Can be filtered by userId query parameter
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // If no userId provided, return all courses
    let query = supabase.from('courses').select('*')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch courses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}