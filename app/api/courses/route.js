import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const courseData = await request.json()

    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return new Response(JSON.stringify({ error: 'Failed to create course' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)

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