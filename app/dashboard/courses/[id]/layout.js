'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { BookOpen, FileText, Code, Layers, ArrowLeft } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CourseLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine active tab based on pathname
  const isTextbookActive = pathname.includes('/textbook') || !pathname.includes('/exercises') && !pathname.includes('/projects');
  const isExercisesActive = pathname.includes('/exercises');
  const isProjectsActive = pathname.includes('/projects');

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          console.error('No authentication token available');
          setLoading(false);
          return;
        }
        
        // Fetch course data
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (error) throw error;
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCourseData();
  }, [courseId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Course Header */}
      {!loading && course && (
        <div className="mb-6">
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Courses</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description || course.topic}</p>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href={`/dashboard/courses/${courseId}/textbook`}
            className={`${
              isTextbookActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <BookOpen size={16} className="mr-1.5" />
            Textbook
          </Link>
          
          <Link
            href={`/dashboard/courses/${courseId}/exercises`}
            className={`${
              isExercisesActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FileText size={16} className="mr-1.5" />
            Exercises
          </Link>
          
          <Link
            href={`/dashboard/courses/${courseId}/projects`}
            className={`${
              isProjectsActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Layers size={16} className="mr-1.5" />
            Projects
          </Link>
        </nav>
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
} 