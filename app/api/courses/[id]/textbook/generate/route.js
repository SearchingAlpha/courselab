import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createStreamingResponse } from '@/lib/streaming';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request, { params }) {
  try {
    const courseId = params.id;
    const { moduleId, chapterId, previousChapters = [], nextChapterCommand = false } = await request.json();
    
    if (!moduleId || !chapterId) {
      return NextResponse.json(
        { message: 'Module ID and Chapter ID are required' },
        { status: 400 }
      );
    }
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Set auth token for supabase client
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseError) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to the course
    if (course.user_id !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Fetch the syllabus to get chapter info
    const { data: syllabus, error: syllabusError } = await supabase
      .from('syllabus')
      .select('content')
      .eq('course_id', courseId)
      .single();
    
    if (syllabusError) {
      return NextResponse.json(
        { message: 'Syllabus not found' },
        { status: 404 }
      );
    }
    
    // Parse syllabus to get module and chapter details
    const syllabusData = JSON.parse(syllabus.content);
    const currentModule = syllabusData.modules.find(m => m.id.toString() === moduleId.toString());
    
    if (!currentModule) {
      return NextResponse.json(
        { message: 'Module not found in syllabus' },
        { status: 404 }
      );
    }
    
    const currentChapter = currentModule.chapters.find(c => c.id.toString() === chapterId.toString());
    
    if (!currentChapter) {
      return NextResponse.json(
        { message: 'Chapter not found in syllabus' },
        { status: 404 }
      );
    }
    
    // Check if this chapter content already exists in the database
    const { data: existingChapter, error: chapterError } = await supabase
      .from('textbook_chapters')
      .select('content')
      .eq('course_id', courseId)
      .eq('module_id', moduleId)
      .eq('chapter_id', chapterId)
      .single();
    
    // If we have content and this is not a regeneration request, return it
    if (existingChapter && !nextChapterCommand) {
      return NextResponse.json({
        content: existingChapter.content,
        moduleId,
        chapterId
      });
    }
    
    // Create the prompt for Claude
    let systemPrompt = `You are an expert educational content creator specializing in creating detailed textbook chapters.
Your task is to create an informative, engaging, and technically accurate chapter for a course about ${course.topic}.

Follow these guidelines:
1. Create content that is appropriate for the user's knowledge level: ${course.knowledge_level}
2. Focus on ${course.focus === 'math-heavy' ? 'mathematical concepts and formal proofs' : 
               course.focus === 'practical' ? 'practical applications and code examples' : 
               'a balanced mix of theory and practice'}
3. Use ${course.approach === 'visual' ? 'visual explanations with diagrams and illustrations described in detail' : 
         course.approach === 'text' ? 'clear textual explanations with precise definitions' : 
         'a mix of visual and textual explanations'}
4. Structure your content with clear headings and subheadings
5. Include examples, applications, and exercises where appropriate
6. Format all content in Markdown with proper headings, code blocks, and equations
7. Keep the chapter length to approximately 10 pages of content`;

    let userPrompt = `Generate a detailed textbook chapter on: "${currentChapter.title}"

This is part of Module ${currentModule.id}: ${currentModule.title}
Chapter time allocation: ${currentChapter.hours} hours

Chapter Description: ${currentChapter.description || 'No specific description provided'}

Learning Goal: ${course.end_goal}`;

    // Add context from previous chapters if available
    if (previousChapters.length > 0) {
      userPrompt += `\n\nContext from previous chapters:`;
      previousChapters.forEach((prev, index) => {
        userPrompt += `\n\nChapter ${prev.chapterId}: ${prev.title}\nSummary: ${prev.summary}`;
      });
    }
    
    userPrompt += `\n\nFormat the content in Markdown with:
- Clear section headings (## for main sections, ### for subsections)
- Code examples in \`\`\`language ... \`\`\` blocks
- Mathematical equations using LaTeX notation with $$ for display equations and $ for inline equations
- Include a brief summary at the end`;

    // Create streaming response
    const streamingResponse = await createStreamingResponse({
      model: "claude-3-opus-20240229",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });
    
    // Save the content to the database
    if (streamingResponse) {
      await supabase
        .from('textbook_chapters')
        .upsert({
          course_id: courseId,
          module_id: moduleId,
          chapter_id: chapterId,
          title: currentChapter.title,
          content: streamingResponse,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'course_id, module_id, chapter_id'
        });
    }
    
    return NextResponse.json({
      content: streamingResponse,
      moduleId,
      chapterId
    });
  } catch (error) {
    console.error('Error generating textbook chapter:', error);
    return NextResponse.json(
      { message: 'Failed to generate textbook chapter. Please try again.', error: error.message },
      { status: 500 }
    );
  }
} 