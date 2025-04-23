import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { createStreamingResponse } from '@/lib/streaming';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { message: 'Course ID is required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the course details
    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

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

    // Create the prompt for Claude
    const prompt = `Create a comprehensive 120-hour syllabus for a course on ${course.topic}.
    Course Details:
    - Title: ${course.title}
    - Topic: ${course.topic}
    - Learning Goal: ${course.endGoal}
    - Knowledge Level: ${course.knowledgeLevel}
    - Focus: ${course.focus}
    - Approach: ${course.approach}

    The syllabus should:
    1. Be divided into logical modules/chapters
    2. Include estimated time for each section
    3. Progress from basic to advanced concepts
    4. Include both theoretical and practical components
    5. End with a capstone project

    Format the output in Markdown with clear headings and sections.`;

    // Create streaming response with correct Claude API message format
    return createStreamingResponse(request, {
      model: "claude-3-opus-20240229",
      messages: [
        {
          role: "assistant",
          content: "I am an expert educational content creator. I will create a well-structured, comprehensive syllabus that follows best practices in curriculum design."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      stream: true
    });

  } catch (error) {
    console.error('Error generating syllabus:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}