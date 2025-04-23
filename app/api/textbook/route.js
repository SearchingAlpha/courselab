import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { createStreamingResponse } from '@/lib/streaming';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId, chapterNumber, topic, previousChapters } = await request.json();

    if (!courseId || !topic) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the prompt for Claude
    const prompt = `Create a detailed textbook chapter about ${topic}. 
    The chapter should be comprehensive but concise, focusing on clear explanations and practical examples.
    Include:
    1. Introduction to the concept
    2. Key principles and theories
    3. Real-world applications
    4. Code examples (if applicable)
    5. Summary and key takeaways
    
    Format the content in Markdown with proper headings and sections.
    Keep the chapter length to about 10 pages.`;

    // Create streaming response
    return createStreamingResponse(request, {
      model: "claude-3-opus-20240229",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator. Create clear, engaging, and technically accurate textbook content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

  } catch (error) {
    console.error('Error generating textbook:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
} 