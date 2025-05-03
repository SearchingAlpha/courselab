'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { FileText, AlertCircle, Loader, Wand2, CheckCircle2, PenTool, ArrowLeft } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
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
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCourseAndSyllabus();
  }, [courseId]);
  
  const handleGenerateExercises = async () => {
    setIsGenerating(true);
    // This is a placeholder for the actual exercises generation functionality
    // We'll implement the backend later
    setTimeout(() => {
      setIsGenerating(false);
      // Placeholder for successful generation
      alert('Exercise generation functionality will be implemented in the backend.');
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
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="bg-blue-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <FileText size={24} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Practice Exercises</h1>
        <p className="text-gray-600">
          Generate practice exercises for each chapter of your course to reinforce learning.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-56 h-72 bg-white rounded-lg shadow-lg transform rotate-1 overflow-hidden">
              <div className="absolute inset-0 p-6 flex flex-col">
                <PenTool size={28} className="text-indigo-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-6 line-clamp-2">Interactive Exercises</p>
                <div className="flex-grow flex items-end">
                  <p className="text-sm text-indigo-600 font-medium">Generated with Claude AI</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Enhance Learning with Practice</h2>
            <p className="text-gray-700 mb-4">
              Generate a variety of exercises for each chapter to help students apply and test their knowledge.
              Each set of exercises will be tailored to the content and difficulty level of your course.
            </p>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-indigo-900 mb-2">Exercise Types:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-2 mt-0.5">
                    <CheckCircle2 size={12} className="text-indigo-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Multiple Choice:</span> Test understanding of key concepts
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-2 mt-0.5">
                    <CheckCircle2 size={12} className="text-indigo-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Problem Solving:</span> Apply knowledge to practical scenarios
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-2 mt-0.5">
                    <CheckCircle2 size={12} className="text-indigo-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Short Answer:</span> Articulate understanding of concepts
                  </span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={handleGenerateExercises}
              disabled={isGenerating}
              className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Generating Exercises...
                </>
              ) : (
                <>
                  <Wand2 size={16} className="mr-2" />
                  Generate Exercises
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {syllabus && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Course Modules</h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Exercises will be generated for each module in your course:
            </p>
            
            <div className="space-y-4">
              {syllabus.modules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Module {module.id}: {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {module.description}
                  </p>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Available after generation:</div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {module.chapters.map((chapter) => (
                        <li key={chapter.id} className="flex items-center justify-between">
                          <span>{chapter.title}</span>
                          <span className="text-xs text-gray-500 italic">Coming soon</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 