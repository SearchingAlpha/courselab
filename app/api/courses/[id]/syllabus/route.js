import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { generateSyllabus, analyzeSyllabus } from '@/lib/agents/syllabusAgent';

<<<<<<< HEAD
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const syllabus = await prisma.syllabus.findUnique({
      where: {
        courseId: resolvedParams.id,
      },
    });

    if (!syllabus) {
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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const course = await prisma.course.findUnique({
      where: {
        id: resolvedParams.id,
      },
      include: {
        syllabus: true,
      },
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // If syllabus already exists, return it
    if (course.syllabus) {
      return NextResponse.json(course.syllabus);
    }

    // Generate new syllabus using the specialized agent
    const content = await generateSyllabus(course);

    // Create a new syllabus in the database
    const syllabus = await prisma.syllabus.create({
      data: {
        content,
        courseId: resolvedParams.id,
      },
    });

    return NextResponse.json(syllabus);
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
=======
// export async function POST(request, { params }) {
//   try {
//     const { id } = params;
    
//     // Get the authenticated user's session
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user) {
//       return NextResponse.json(
//         { message: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     // Fetch the course
//     const course = await prisma.course.findUnique({
//       where: {
//         id,
//       },
//     });
    
//     // Check if course exists
//     if (!course) {
//       return NextResponse.json(
//         { message: 'Course not found' },
//         { status: 404 }
//       );
//     }
    
//     // Check if the user has access to this course
//     if (course.userId !== session.user.id) {
//       return NextResponse.json(
//         { message: 'Unauthorized' },
//         { status: 403 }
//       );
//     }
    
//     // Generate syllabus using AI
//     const syllabus = await syllabusAgent.generateSyllabus(course);
    
//     // In a production app, save the syllabus to the database
//     // For now, we'll just return it
    
//     return NextResponse.json(syllabus);
//   } catch (error) {
//     console.error('Error generating syllabus:', error);
//     return NextResponse.json(
//       { message: 'Failed to generate syllabus. Please try again.' },
//       { status: 500 }
//     );
//   }
// }

import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (courseError) throw courseError

    // TODO: Implement syllabus generation logic
    const syllabus = []

    return new Response(JSON.stringify(syllabus), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating syllabus:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate syllabus',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
>>>>>>> master
}