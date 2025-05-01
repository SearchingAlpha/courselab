import { NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';
import { generateSyllabus, analyzeSyllabus } from '@/lib/agents/syllabusAgent';

export async function GET(req, { params }) {
  try {
    // Authenticate using Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    
    // Fetch syllabus using Supabase
    const { data: syllabus, error } = await supabase
      .from('syllabus')
      .select('*')
      .eq('course_id', resolvedParams.id)
      .single();

    if (error) {
      console.error('Error fetching syllabus:', error);
      return new NextResponse('Syllabus not found', { status: 404 });
    }

    // If analysis is requested, provide feedback on the syllabus
    const searchParams = new URL(req.url).searchParams;
    if (searchParams.get('analyze') === 'true') {
      const analysis = await analyzeSyllabus(syllabus.content);
      return NextResponse.json({ content: analysis });
    }

    return NextResponse.json(syllabus);
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    // Authenticate using Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    
    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (courseError) {
      console.error('Error fetching course:', courseError);
      return new NextResponse('Course not found', { status: 404 });
    }

    // Check if syllabus already exists
    const { data: existingSyllabus, error: syllabusError } = await supabase
      .from('syllabus')
      .select('*')
      .eq('course_id', resolvedParams.id)
      .single();

    // If syllabus exists and we're not regenerating, return it
    const searchParams = new URL(req.url).searchParams;
    const regenerate = searchParams.get('regenerate') === 'true';
    
    if (existingSyllabus && !regenerate) {
      return NextResponse.json(existingSyllabus);
    }

    // Generate new syllabus using the specialized agent
    const content = await generateSyllabus(course);

    if (existingSyllabus) {
      // Update existing syllabus
      const { data: updatedSyllabus, error: updateError } = await supabase
        .from('syllabus')
        .update({ content })
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
          course_id: resolvedParams.id
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
    console.error('Error generating syllabus:', error);
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