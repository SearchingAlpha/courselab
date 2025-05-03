import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSyllabus, analyzeSyllabus } from '@/lib/agents/syllabusAgent';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req, { params }) {
  try {
    // Get the current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch syllabus using Supabase
    const { data: syllabus, error: syllabusError } = await supabase
      .from('syllabus')
      .select('*')
      .eq('course_id', params.id)
      .single();

    if (syllabusError && syllabusError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching syllabus:', syllabusError);
      return new NextResponse('Error fetching syllabus', { status: 500 });
    }

    if (!syllabus) {
      return new NextResponse('Syllabus not found', { status: 404 });
    }

    // If analysis is requested, provide feedback on the syllabus
    const searchParams = new URL(req.url).searchParams;
    if (searchParams.get('analyze') === 'true') {
      const analysis = await analyzeSyllabus(syllabus.content);
      return new NextResponse(analysis, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return NextResponse.json(syllabus);
  } catch (error) {
    console.error('Error in GET syllabus:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    // Get the current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if course exists and user has access
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (courseError || !course) {
      console.error('Error fetching course:', courseError);
      return new NextResponse('Course not found', { status: 404 });
    }

    // Check if syllabus already exists
    const { data: existingSyllabus, error: syllabusError } = await supabase
      .from('syllabus')
      .select('*')
      .eq('course_id', params.id)
      .single();

    // If syllabus exists and we're not regenerating, return it
    const searchParams = new URL(req.url).searchParams;
    const regenerate = searchParams.get('regenerate') === 'true';
    
    if (existingSyllabus && !regenerate) {
      return NextResponse.json(existingSyllabus);
    }

    // Generate new syllabus content
    const content = await generateSyllabus(course);

    if (existingSyllabus) {
      // Update existing syllabus
      const { data: updatedSyllabus, error: updateError } = await supabase
        .from('syllabus')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSyllabus.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating syllabus:', updateError);
        return new NextResponse('Failed to update syllabus', { status: 500 });
      }

      return NextResponse.json(updatedSyllabus);
    } else {
      // Create a new syllabus
      const { data: newSyllabus, error: createError } = await supabase
        .from('syllabus')
        .insert([{
          content,
          course_id: params.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating syllabus:', createError);
        return new NextResponse('Failed to create syllabus', { status: 500 });
      }

      return NextResponse.json(newSyllabus);
    }
  } catch (error) {
    console.error('Error in POST syllabus:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Helper function to convert stream to string
async function streamToString(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }

  return result;
}