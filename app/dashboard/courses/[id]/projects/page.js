'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Layers, AlertCircle, Loader, Code, Lightbulb, Wand2, GitBranch } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProjectsPage() {
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
  
  const handleGenerateProjects = async () => {
    setIsGenerating(true);
    // This is a placeholder for the actual projects generation functionality
    // We'll implement the backend later
    setTimeout(() => {
      setIsGenerating(false);
      // Placeholder for successful generation
      alert('Project generation functionality will be implemented in the backend.');
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
        <div className="bg-purple-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <Layers size={24} className="text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Projects</h1>
        <p className="text-gray-600">
          Generate hands-on projects for your course that apply theoretical knowledge to real-world problems.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-56 h-72 bg-white rounded-lg shadow-lg transform rotate-1 overflow-hidden">
              <div className="absolute inset-0 p-6 flex flex-col">
                <GitBranch size={28} className="text-purple-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-6 line-clamp-2">Applied Projects</p>
                <div className="flex-grow flex items-end">
                  <p className="text-sm text-purple-600 font-medium">Generated with Claude AI</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Apply Knowledge with Real Projects</h2>
            <p className="text-gray-700 mb-4">
              Generate comprehensive projects that encourage students to apply what they've learned.
              Each project includes objectives, specifications, and evaluation criteria to guide implementation.
            </p>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-purple-900 mb-2">Project Features:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-1 mr-2 mt-0.5">
                    <Lightbulb size={12} className="text-purple-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Clear Objectives:</span> Focused learning goals
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-1 mr-2 mt-0.5">
                    <Lightbulb size={12} className="text-purple-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Practical Application:</span> Real-world relevance
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-1 mr-2 mt-0.5">
                    <Lightbulb size={12} className="text-purple-700" />
                  </div>
                  <span className="text-gray-700">
                    <span className="font-medium">Detailed Guidance:</span> Step-by-step instructions
                  </span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={handleGenerateProjects}
              disabled={isGenerating}
              className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isGenerating ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Generating Projects...
                </>
              ) : (
                <>
                  <Wand2 size={16} className="mr-2" />
                  Generate Projects
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {syllabus && (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
            <Lightbulb size={18} className="text-amber-500 mr-2" />
            <h2 className="font-medium text-gray-900">Potential Projects</h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              After generation, you'll have access to projects tailored to your course modules:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {syllabus.modules.map((module, index) => (
                <div 
                  key={module.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 rounded-full p-1.5 mr-2">
                      <Code size={14} className="text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Module {module.id}: {module.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {module.description}
                  </p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Approx. duration: 1-2 weeks</span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Coming soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-start">
          <AlertCircle size={20} className="text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Ready to create projects?</h3>
            <p className="text-gray-600 text-sm">
              Click the "Generate Projects" button above to create carefully designed projects for your course.
              Each project will be tailored to reinforce the concepts covered in your modules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 