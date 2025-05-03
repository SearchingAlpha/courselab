import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request, { params }) {
  try {
    const { id: courseId, moduleId, chapterId } = params;
    
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
    
    // Fetch the textbook chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('textbook_chapters')
      .select('*')
      .eq('course_id', courseId)
      .eq('module_id', moduleId)
      .eq('chapter_id', chapterId)
      .single();
    
    if (chapterError) {
      return NextResponse.json(
        { message: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Fetch the syllabus to get next/prev chapter info
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
    
    // Parse syllabus to get navigation info
    const syllabusData = JSON.parse(syllabus.content);
    
    // Find current module
    const currentModule = syllabusData.modules.find(m => m.id.toString() === moduleId.toString());
    
    if (!currentModule) {
      return NextResponse.json(
        { message: 'Module not found in syllabus' },
        { status: 404 }
      );
    }
    
    // Find adjacent chapters for navigation
    let prevChapter = null;
    let nextChapter = null;
    
    // Find previous and next chapters within the same module
    const chapterIndex = currentModule.chapters.findIndex(c => c.id.toString() === chapterId.toString());
    
    if (chapterIndex > 0) {
      prevChapter = {
        moduleId,
        id: currentModule.chapters[chapterIndex - 1].id,
        title: currentModule.chapters[chapterIndex - 1].title
      };
    } else {
      // Look for previous module's last chapter
      const moduleIndex = syllabusData.modules.findIndex(m => m.id.toString() === moduleId.toString());
      if (moduleIndex > 0) {
        const prevModule = syllabusData.modules[moduleIndex - 1];
        const lastChapter = prevModule.chapters[prevModule.chapters.length - 1];
        prevChapter = {
          moduleId: prevModule.id,
          id: lastChapter.id,
          title: lastChapter.title
        };
      }
    }
    
    if (chapterIndex < currentModule.chapters.length - 1) {
      nextChapter = {
        moduleId,
        id: currentModule.chapters[chapterIndex + 1].id,
        title: currentModule.chapters[chapterIndex + 1].title
      };
    } else {
      // Look for next module's first chapter
      const moduleIndex = syllabusData.modules.findIndex(m => m.id.toString() === moduleId.toString());
      if (moduleIndex < syllabusData.modules.length - 1) {
        const nextModule = syllabusData.modules[moduleIndex + 1];
        const firstChapter = nextModule.chapters[0];
        nextChapter = {
          moduleId: nextModule.id,
          id: firstChapter.id,
          title: firstChapter.title
        };
      }
    }
    
    // Get all chapters for sidebar navigation
    const allChapters = syllabusData.modules.reduce((chapters, module) => {
      return [...chapters, ...module.chapters.map(chapter => ({
        moduleId: module.id,
        id: chapter.id,
        title: chapter.title
      }))];
    }, []);
    
    return NextResponse.json({
      chapter,
      prevChapter,
      nextChapter,
      allChapters
    });
  } catch (error) {
    console.error('Error retrieving textbook chapter:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve textbook chapter. Please try again.', error: error.message },
      { status: 500 }
    );
  }
} 