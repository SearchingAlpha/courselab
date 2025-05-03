'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, ChevronRight, AlertCircle, FileText, Clock, Loader } from 'lucide-react';
import { use } from 'react';

export default function ChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  
  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModule, setActiveModule] = useState(null);
  const [generatingChapter, setGeneratingChapter] = useState(null);

  useEffect(() => {
    async function fetchCourseAndSyllabus() {
      try {
        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);
        
        // Fetch syllabus data
        const syllabusResponse = await fetch(`/api/courses/${courseId}/syllabus`);
        if (!syllabusResponse.ok) {
          throw new Error('Failed to fetch syllabus');
        }
        const syllabusData = await syllabusResponse.json();
        setSyllabus(syllabusData);
        
        // Set the first module as active by default
        if (syllabusData.modules && syllabusData.modules.length > 0) {
          setActiveModule(syllabusData.modules[0].id);
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
  
  // This function is now only used as a fallback in case we want to implement chapter generation
  // directly from this page in the future
  const handleGenerateChapter = async (moduleId, chapterTitle) => {
    setGeneratingChapter(chapterTitle);
    
    try {
      // Navigate to the textbook page which will handle the generation
      const chapterId = chapterTitle.toLowerCase().replace(/\s+/g, '-');
      router.push(`/dashboard/courses/${courseId}/textbook/module-${moduleId}/${chapterId}`);
    } catch (err) {
      console.error('Error navigating to chapter:', err);
      setError('Failed to open chapter. Please try again.');
      setGeneratingChapter(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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
    <div className="max-w-6xl mx-auto">
      {/* Header section */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/dashboard/courses/${courseId}/generate-syllabus`)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to syllabus</span>
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description || course.topic}</p>
        
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {course.knowledge_level}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {course.focus === 'math-heavy' && 'Math-focused'}
            {course.focus === 'balanced' && 'Balanced'}
            {course.focus === 'practical' && 'Practical'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {course.approach === 'visual' && 'Visual'}
            {course.approach === 'text' && 'Text-based'}
            {course.approach === 'both' && 'Balanced approach'}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 flex items-start">
          <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar - Module navigation */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-gray-900 mb-4">Modules</h3>
            <nav className="space-y-1">
              {syllabus.modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeModule === module.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>Module {module.id}</span>
                    <span className="text-xs text-gray-500">{module.hours}h</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{module.title}</div>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Main content - Chapter list */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {syllabus.modules.map((module) => (
              <div 
                key={module.id} 
                className={activeModule === module.id ? 'block' : 'hidden'}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Module {module.id}: {module.title}
                  </h2>
                  <p className="text-gray-600">{module.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock size={16} className="mr-1" />
                    {module.hours} hours
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Chapters</h3>
                  {module.chapters.map((chapter, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Clock size={14} className="mr-1" />
                            {chapter.hours} hours
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {chapter.description || "No description available."}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/courses/${courseId}/textbook/module-${module.id}/${chapter.title.toLowerCase().replace(/\s+/g, '-')}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <BookOpen size={14} className="mr-1.5" />
                          Open Textbook
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}