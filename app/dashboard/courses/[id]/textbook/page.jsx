'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { BookOpen, ArrowLeft, ChevronRight, AlertCircle, FileText, Clock, Loader, Book } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TextbookLandingPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [chapters, setChapters] = useState([]);
  
  useEffect(() => {
    async function fetchCourseAndSyllabus() {
      try {
        // Get current session token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('No authentication token available. Please try logging in again.');
        }
        
        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (courseError) throw courseError;
        setCourse(courseData);
        
        // Fetch syllabus data
        const { data: syllabusData, error: syllabusError } = await supabase
          .from('syllabus')
          .select('content')
          .eq('course_id', courseId)
          .single();
        
        if (syllabusError) throw syllabusError;
        
        // Parse the syllabus content
        const parsedSyllabus = JSON.parse(syllabusData.content);
        setSyllabus(parsedSyllabus);
        
        // Flatten chapters into a single array
        const allChapters = parsedSyllabus.modules.reduce((acc, module) => {
          const moduleChapters = module.chapters.map(chapter => ({
            ...chapter,
            moduleId: module.id,
            moduleTitle: module.title
          }));
          return [...acc, ...moduleChapters];
        }, []);
        
        setChapters(allChapters);
        
        // Fetch existing generated chapters to mark them
        const { data: generatedChapters, error: chaptersError } = await supabase
          .from('textbook_chapters')
          .select('module_id, chapter_id')
          .eq('course_id', courseId);
        
        if (!chaptersError && generatedChapters.length > 0) {
          // Update chapters with generated status
          const updatedChapters = allChapters.map(chapter => {
            const isGenerated = generatedChapters.some(
              gc => gc.module_id.toString() === chapter.moduleId.toString() && 
                    gc.chapter_id.toString() === chapter.id.toString()
            );
            return { ...chapter, isGenerated };
          });
          
          setChapters(updatedChapters);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCourseAndSyllabus();
  }, [courseId]);
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (!course || !syllabus) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 inline-block p-3 rounded-full mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Course not found</h2>
        <p className="text-gray-600 mb-6">
          The course you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => router.push('/dashboard/courses')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Courses
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <Link
              href={`/dashboard/courses/${courseId}/chapters`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Chapters</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title} Textbook</h1>
            <p className="text-gray-600 mb-4">
              AI-generated comprehensive textbook for your course on {course.topic}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/courses/${courseId}/chapters`}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center"
            >
              <Clock size={16} className="mr-1.5" />
              <span>View Chapters</span>
            </Link>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 flex items-start">
          <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      {/* Textbook introduction */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-56 h-72 bg-white rounded-lg shadow-lg transform rotate-1 overflow-hidden">
              <div className="absolute inset-0 p-6 flex flex-col">
                <BookOpen size={28} className="text-blue-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-6 line-clamp-2">AI-Generated Textbook</p>
                <div className="flex-grow flex items-end">
                  <p className="text-sm text-blue-600 font-medium">Generated with Claude AI</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Custom AI-Generated Textbook</h2>
            <p className="text-gray-700 mb-4">
              The textbook is generated based on your specific course preferences, learning goals, and syllabus.
              Each chapter provides comprehensive coverage with clear explanations, examples, and exercises.
            </p>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">Textbook Features:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <ChevronRight size={12} className="text-blue-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Customized Content:</span> Tailored to your knowledge level ({course.knowledge_level})
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <ChevronRight size={12} className="text-blue-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Focus:</span> {course.focus === 'math-heavy' ? 'Mathematical concepts and formal proofs' : 
                            course.focus === 'practical' ? 'Practical applications and code examples' : 
                            'Balanced mix of theory and practice'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <ChevronRight size={12} className="text-blue-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Approach:</span> {course.approach === 'visual' ? 'Visual explanations with detailed descriptions' : 
                              course.approach === 'text' ? 'Clear textual explanations with precise definitions' : 
                              'Mix of visual and textual explanations'}
                  </span>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-600 text-sm">
              Each chapter is generated on-demand and can be customized further if needed.
            </p>
          </div>
        </div>
      </div>
      
      {/* Chapters grid */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Textbook Chapters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-200 transition-colors hover:shadow-md"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Module {chapter.moduleId}</div>
                <h3 className="font-medium text-gray-900 line-clamp-1">{chapter.title}</h3>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {chapter.description || `This chapter covers key concepts related to ${chapter.title}.`}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    {chapter.hours} hours
                  </div>
                  
                  <Link
                    href={`/dashboard/courses/${courseId}/textbook/module-${chapter.moduleId}/${chapter.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {chapter.isGenerated ? (
                      <>
                        <Book size={14} className="mr-1.5" />
                        Read
                      </>
                    ) : (
                      <>
                        <BookOpen size={14} className="mr-1.5" />
                        Open
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 