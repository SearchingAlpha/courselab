// app/api/courses/[id]/textbook/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';
//import { textbookAgent } from '@/lib/ai-agents';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { moduleId, chapterId } = await request.json();
    
    if (!moduleId || !chapterId) {
      return NextResponse.json(
        { message: 'Module ID and Chapter ID are required' },
        { status: 400 }
      );
    }
    
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch the course
    const course = await prisma.course.findUnique({
      where: {
        id,
      },
    });
    
    // Check if course exists
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check if the user has access to this course
    if (course.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // In a production app, we would fetch the syllabus data from the database
    // For now, we'll simulate module and chapter data
    
    // Fetch syllabus or module/chapter details
    // This is a placeholder - in a real app, you'd fetch this from the database
    const module = {
      id: moduleId,
      title: "Sample Module",
      description: "This is a sample module description",
    };
    
    const chapter = {
      id: chapterId,
      title: "Sample Chapter",
    };
    
    // Generate textbook chapter content using AI
    const chapterContent = await textbookAgent.generateChapter(course, module, chapter);
    
    // In a production app, save the chapter content to the database
    // For now, we'll just return it
    
    return NextResponse.json({
      moduleId,
      chapterId,
      content: chapterContent
    });
  } catch (error) {
    console.error('Error generating textbook chapter:', error);
    return NextResponse.json(
      { message: 'Failed to generate textbook chapter. Please try again.' },
      { status: 500 }
    );
  }
}