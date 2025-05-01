'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Code, Plus, Layout, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Sample placeholder data - would be replaced with actual data from API
  const recentCourses = [
    {
      id: '1',
      title: 'Advanced Machine Learning',
      progress: 45,
      lastAccessed: '2 days ago',
    },
    {
      id: '2',
      title: 'Data Structures & Algorithms',
      progress: 72,
      lastAccessed: '4 days ago',
    },
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.user_metadata?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-gray-600">
          Continue learning or create a new course to master complex topics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <div className="bg-blue-100 text-blue-600 text-xs font-semibold rounded-full px-2 py-1">
              {recentCourses.length || 0}
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-1 mb-4">Courses you've created or enrolled in</p>
          <Link 
            href="/dashboard/courses" 
            className="flex items-center text-blue-600 hover:text-blue-700 transition"
          >
            <BookOpen size={16} className="mr-1" />
            <span className="text-sm font-medium">View all courses</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900">Create Course</h2>
            <div className="bg-green-100 text-green-600 text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
              <Plus size={14} />
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-1 mb-4">Start a new course with AI assistance</p>
          <Link 
            href="/dashboard/create-course" 
            className="flex items-center text-green-600 hover:text-green-700 transition"
          >
            <Layout size={16} className="mr-1" />
            <span className="text-sm font-medium">Create new course</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-purple-100">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <div className="bg-purple-100 text-purple-600 text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-1 mb-4">Your latest learning sessions</p>
          <Link 
            href="/dashboard/activity" 
            className="flex items-center text-purple-600 hover:text-purple-700 transition"
          >
            <Code size={16} className="mr-1" />
            <span className="text-sm font-medium">View activity</span>
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
          <Link 
            href="/dashboard/courses" 
            className="text-sm text-blue-600 hover:text-blue-700 transition"
          >
            View all
          </Link>
        </div>
        
        {recentCourses.length > 0 ? (
          <div className="space-y-4">
            {recentCourses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">{course.title}</h3>
                  <span className="text-xs text-gray-500">{course.lastAccessed}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-medium text-gray-700">{course.progress}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    Continue learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
            <Link
              href="/dashboard/create-course"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Plus size={16} className="mr-2" />
              Create your first course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}