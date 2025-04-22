// app/api/courses/[id]/project/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { projectAgent } from '@/lib/ai-agents';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
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
    // For now, we'll simulate modules data
    
    // This is a placeholder - in a real app, you'd fetch this from the database
    const modules = [
      {
        id: 1,
        title: "Foundations and Prerequisites",
        description: "Establishing core knowledge and prerequisites for the course"
      },
      {
        id: 2,
        title: "Core Concepts",
        description: "Fundamental principles and key concepts of the subject"
      },
      // Additional modules would be fetched from the database
    ];
    
    // Generate project using AI
    const project = await projectAgent.generateProject(course, modules);
    
    // In a production app, save the project to the database
    // For now, we'll just return it
    
    return NextResponse.json({
      project
    });
  } catch (error) {
    console.error('Error generating project:', error);
    return NextResponse.json(
      { message: 'Failed to generate project. Please try again.' },
      { status: 500 }
    );
  }
}