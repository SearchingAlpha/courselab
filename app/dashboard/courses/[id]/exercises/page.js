'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { FileText, AlertCircle, Loader } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ExercisesPage() {
  const params = useParams();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
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
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size={32} className="animate-spin text-blue-600" />
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
          This section will contain practice exercises for each chapter of your course.
        </p>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <AlertCircle size={20} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Coming Soon</h3>
            <p className="text-gray-600 text-sm">
              The exercises feature is currently in development. Soon you'll be able to:
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm mt-2 space-y-1">
              <li>Generate practice problems for each chapter</li>
              <li>Test your knowledge with interactive quizzes</li>
              <li>Get instant feedback on your solutions</li>
              <li>Track your progress through the course material</li>
            </ul>
          </div>
        </div>
      </div>
      
      {syllabus && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Course Modules</h2>
          </div>
          <div className="p-6">
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
                    <div className="text-xs text-gray-500 mb-1">Future exercises will cover:</div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {module.chapters.map((chapter) => (
                        <li key={chapter.id}>
                          {chapter.title}
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