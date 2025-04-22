'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, Check, Clock, Loader2 } from 'lucide-react';

export default function GenerateSyllabusPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [syllabus, setSyllabus] = useState(null);
  
  // Fetch course details
  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch course');
        }
        
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCourse();
  }, [courseId]);
  
  // Generate syllabus
  const generateSyllabus = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch(`/api/courses/${courseId}/syllabus`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate syllabus');
      }
      
      setSyllabus(data);
    } catch (err) {
      console.error('Error generating syllabus:', err);
      setError('Failed to generate syllabus. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Mock syllabus data for demo
  const mockSyllabus = {
    title: 'Advanced Machine Learning',
    description: 'A comprehensive course on advanced machine learning techniques with practical implementations',
    totalHours: 120,
    modules: [
      {
        id: 1,
        title: 'Foundations of Machine Learning',
        description: 'Review of essential concepts and mathematical foundations',
        hours: 15,
        chapters: [
          { title: 'Linear Algebra Review', hours: 3 },
          { title: 'Probability and Statistics', hours: 4 },
          { title: 'Optimization Techniques', hours: 4 },
          { title: 'Introduction to Neural Networks', hours: 4 },
        ],
      },
      {
        id: 2,
        title: 'Supervised Learning Algorithms',
        description: 'Deep dive into advanced supervised learning methods',
        hours: 25,
        chapters: [
          { title: 'Support Vector Machines', hours: 5 },
          { title: 'Random Forests and Ensembles', hours: 5 },
          { title: 'Gradient Boosting Methods', hours: 5 },
          { title: 'Deep Neural Networks', hours: 5 },
          { title: 'Transfer Learning', hours: 5 },
        ],
      },
      {
        id: 3,
        title: 'Unsupervised Learning',
        description: 'Techniques for unlabeled data and pattern recognition',
        hours: 20,
        chapters: [
          { title: 'Clustering Algorithms', hours: 5 },
          { title: 'Dimensionality Reduction', hours: 5 },
          { title: 'Autoencoders', hours: 5 },
          { title: 'Generative Models', hours: 5 },
        ],
      },
      {
        id: 4,
        title: 'Reinforcement Learning',
        description: 'Learning through interaction with environments',
        hours: 20,
        chapters: [
          { title: 'Markov Decision Processes', hours: 4 },
          { title: 'Q-Learning and SARSA', hours: 4 },
          { title: 'Policy Gradients', hours: 4 },
          { title: 'Deep Reinforcement Learning', hours: 4 },
          { title: 'Multi-Agent Systems', hours: 4 },
        ],
      },
      {
        id: 5,
        title: 'Advanced Topics',
        description: 'Cutting-edge techniques and applications',
        hours: 25,
        chapters: [
          { title: 'Attention Mechanisms', hours: 5 },
          { title: 'Transformer Networks', hours: 5 },
          { title: 'Graph Neural Networks', hours: 5 },
          { title: 'Meta-Learning', hours: 5 },
          { title: 'Ethics and Fairness in ML', hours: 5 },
        ],
      },
      {
        id: 6,
        title: 'Capstone Project',
        description: 'Apply learned concepts in a comprehensive project',
        hours: 15,
        chapters: [
          { title: 'Project Scoping and Design', hours: 3 },
          { title: 'Implementation', hours: 7 },
          { title: 'Evaluation and Optimization', hours: 3 },
          { title: 'Documentation and Presentation', hours: 2 },
        ],
      },
    ],
  };
  
  // If loading course data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading course details...</span>
      </div>
    );
  }
  
  // If course not found
  if (!course && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 inline-block p-3 rounded-full mb-4">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
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
    <div className="max-w-4xl mx-auto">
      {/* Header section */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/courses')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to courses</span>
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course?.title}</h1>
        <p className="text-gray-600 mb-4">{course?.description || course?.topic}</p>
        
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {course?.knowledgeLevel}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {course?.focus === 'math-heavy' && 'Math-focused'}
            {course?.focus === 'balanced' && 'Balanced'}
            {course?.focus === 'code-heavy' && 'Code-focused'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {course?.approach === 'theory' && 'Theory-focused'}
            {course?.approach === 'practice' && 'Practice-focused'}
            {course?.approach === 'both' && 'Balanced approach'}
          </span>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Syllabus generation section */}
      {!syllabus ? (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Generate Course Syllabus</h2>
              <p className="text-gray-600">Create a structured 120-hour learning path based on your requirements</p>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-2">What to expect</h3>
            <ul className="space-y-3">
              <li className="flex">
                <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>6-8 carefully structured modules tailored to your learning goals</span>
              </li>
              <li className="flex">
                <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Detailed chapter breakdown with time allocations</span>
              </li>
              <li className="flex">
                <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Progressive concept building toward your specified end goal</span>
              </li>
              <li className="flex">
                <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Capstone project component to apply your knowledge</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6">
            <button
              onClick={generateSyllabus}
              disabled={isGenerating}
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Generating Syllabus...
                </>
              ) : (
                <>
                  <span className="font-mono mr-2">generate-syllabus</span>
                  Start Generation
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Display generated syllabus (using mockSyllabus for now)
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold">Course Syllabus</h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{mockSyllabus.title}</h3>
              <p className="text-gray-600 mb-4">{mockSyllabus.description}</p>
              
              <div className="flex items-center text-gray-600">
                <Clock size={18} className="mr-2" />
                <span>{mockSyllabus.totalHours} hours total</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {mockSyllabus.modules.map((module) => (
                <div key={module.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium">Module {module.id}: {module.title}</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {module.hours} hours
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Chapters</h5>
                    <ul className="space-y-2">
                      {module.chapters.map((chapter, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{chapter.title}</span>
                          <span className="text-gray-500">{chapter.hours} hours</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Next step: Generate textbook content for each chapter
                </p>
              </div>
              
              <button
                onClick={() => router.push(`/dashboard/courses/${courseId}/chapters`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Continue to Chapters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}