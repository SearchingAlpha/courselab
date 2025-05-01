import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch course' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PUT(request, { params }) {
  try {
    const courseData = await request.json()

    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return new Response(JSON.stringify({ error: 'Failed to update course', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting course:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete course', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}