'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { BookOpen, ArrowLeft, ChevronRight, AlertCircle, FileText, Clock, Loader, Book, Wand2, BookText, Sparkles, Download } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TextbookPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
  
  const handleGenerateTextbook = async () => {
    setIsGenerating(true);
    // This is a placeholder for the actual textbook generation functionality
    // We'll implement the backend later
    setTimeout(() => {
      setIsGenerating(false);
      // Placeholder for successful generation - in real implementation, we would refresh the data
      // or redirect to the first chapter
      alert('Textbook generation functionality will be implemented in the backend.');
    }, 2000);
  };
  
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
    <div className="bg-white rounded-lg shadow-sm p-8">
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 flex items-start">
          <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="bg-blue-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <BookOpen size={24} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Textbook</h1>
        <p className="text-gray-600">
          Generate a comprehensive textbook based on your course syllabus.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-56 h-72 bg-white rounded-lg shadow-lg transform rotate-1 overflow-hidden">
              <div className="absolute inset-0 p-6 flex flex-col">
                <BookText size={28} className="text-blue-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-6 line-clamp-2">Interactive Textbook</p>
                <div className="flex-grow flex items-end">
                  <p className="text-sm text-blue-600 font-medium">Generated with Claude AI</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Create Your Textbook</h2>
            <p className="text-gray-700 mb-4">
              Your textbook will include comprehensive explanations, examples, and visual aids based on your syllabus.
              Each chapter will cover the topics outlined in your course structure.
            </p>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">What You'll Get:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <Sparkles size={12} className="text-blue-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Comprehensive Content:</span> Detailed explanations for each chapter
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <Sparkles size={12} className="text-blue-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Customized Approach:</span> Content tailored to your specified teaching style and difficulty level
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <Sparkles size={12} className="text-blue-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Interactive Format:</span> Easily navigate between chapters and modules
                  </span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={handleGenerateTextbook}
              disabled={isGenerating}
              className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isGenerating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Generating Textbook...
                </>
              ) : (
                <>
                  <Wand2 size={16} className="mr-2" />
                  Generate Textbook
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Textbook Generation Process</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <div className="text-lg font-bold text-blue-600">1</div>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Analysis</h3>
            <p className="text-sm text-gray-600">
              Our AI analyzes your course structure, learning objectives, and syllabus to understand the scope and requirements.
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <div className="text-lg font-bold text-blue-600">2</div>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Content Creation</h3>
            <p className="text-sm text-gray-600">
              Each chapter is generated with detailed explanations, examples, and visuals based on your preferences.
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <div className="text-lg font-bold text-blue-600">3</div>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Delivery</h3>
            <p className="text-sm text-gray-600">
              The complete textbook is organized into an easy-to-navigate format that integrates with your course.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-start">
          <Download size={20} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Ready to begin?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Click the "Generate Textbook" button above to create a comprehensive textbook for your course. 
              The process may take a few minutes depending on the size of your syllabus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 