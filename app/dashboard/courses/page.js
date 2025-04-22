'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Clock, ChevronRight, AlertCircle } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load your courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <Link
          href="/dashboard/create-course"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Create New Course
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 flex items-start">
          <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-6">
            Start by creating your first course with AI-generated content.
          </p>
          <Link
            href="/dashboard/create-course"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.focus === 'math-heavy' && 'Math-focused'}
                    {course.focus === 'balanced' && 'Balanced'}
                    {course.focus === 'code-heavy' && 'Code-focused'}
                  </span>
                  <span className="inline-flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    120 hours
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description || course.topic.substring(0, 150)}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <Link
                    href={`/dashboard/courses/${course.id}/generate-syllabus`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                  >
                    Continue
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                  <span className="text-xs text-gray-500">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}