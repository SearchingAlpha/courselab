'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Layers, AlertCircle, Loader, Code, Lightbulb } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProjectsPage() {
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
  
  // Sample project ideas based on the course topic
  const getProjectIdeas = (topic) => {
    const defaultIdeas = [
      "Build a comprehensive application",
      "Create a research project",
      "Develop a practical implementation"
    ];
    
    // Course-specific project ideas could be generated here
    return defaultIdeas;
  };
  
  const projectIdeas = course ? getProjectIdeas(course.topic) : [];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="bg-purple-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <Layers size={24} className="text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Projects</h1>
        <p className="text-gray-600">
          Apply what you've learned with hands-on projects that reinforce key concepts.
        </p>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <AlertCircle size={20} className="text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Coming Soon</h3>
            <p className="text-gray-600 text-sm">
              The projects feature is currently in development. Soon you'll be able to:
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm mt-2 space-y-1">
              <li>Access hands-on projects tailored to your course</li>
              <li>Receive step-by-step guidance and instructions</li>
              <li>Submit your work for AI-assisted feedback</li>
              <li>Build a portfolio of completed projects</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Project Ideas Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
          <Lightbulb size={18} className="text-amber-500 mr-2" />
          <h2 className="font-medium text-gray-900">Project Ideas</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Based on your course on {course?.topic}, here are some project ideas you might consider:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectIdeas.map((idea, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                <div className="flex items-center mb-2">
                  <div className="bg-purple-100 rounded-full p-1 mr-2">
                    <Code size={16} className="text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Project Idea {index + 1}</h3>
                </div>
                <p className="text-sm text-gray-600">{idea} related to {course?.topic}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Module Projects Section */}
      {syllabus && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Module-Based Projects</h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Future projects will be available for each module in your course:
            </p>
            
            <div className="space-y-4">
              {syllabus.modules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Module {module.id}: {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {module.description}
                  </p>
                  <div className="bg-purple-50 border border-purple-100 rounded p-3">
                    <h4 className="text-sm font-medium text-purple-800 mb-1">
                      Possible Project: {module.title} Implementation
                    </h4>
                    <p className="text-xs text-gray-600">
                      Create a practical application demonstrating the key concepts from this module.
                    </p>
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