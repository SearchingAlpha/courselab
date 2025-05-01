'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';
import { supabase, getUser, getSession } from '@/lib/auth';

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Get user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        // Use the auth client's getUser function
        const user = await getUser();
        
        if (user?.email) {
          setUserEmail(user.email);
          console.log('Found user email:', user.email);
        } else {
          console.log('No user email found in session');
          
          // Fallback to session check for debugging
          const session = await getSession();
          if (session?.user?.email) {
            console.log('Found email in session fallback:', session.user.email);
            setUserEmail(session.user.email);
          } else {
            console.log('No user email found in session 2');
          }
        }
      } catch (err) {
        console.error('Failed to get user info:', err);
      }
    };
    
    getUserEmail();
  }, []);
  
  // Form state
  const [courseData, setCourseData] = useState({
    title: '',
    topic: '',
    end_goal: '',
    knowledge_level: 'beginner',
    focus: 'balanced',
    approach: 'both',
  });
  
  // Update form data when inputs change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value,
    });
  };
  
  // Proceed to next step
  const nextStep = (e) => {
    e.preventDefault();
    // Validate current step
    if (step === 1) {
      if (!courseData.title || !courseData.topic) {
        setError('Please fill in all required fields');
        return;
      }
    }
    else if (step === 2) {
      if (!courseData.end_goal) {
        setError('Please specify your learning goal');
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };
  
  // Go back to previous step
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Simple form submit function that calls the API endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!userEmail) {
      setError('No user email found. Please try again or refresh the page.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Send data to the API endpoint with the user email
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...courseData,
          userEmail
        })
      });
      
      // Handle API response
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse API response:', err);
        throw new Error('Server returned an invalid response');
      }
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || data.details || 'Failed to create course');
      }
      
      // Navigate to the new course
      router.push(`/dashboard/courses/${data.id}/generate-syllabus`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render different step content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Advanced Machine Learning"
                required
              />
            </div>
            
            {userEmail && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Creating course as: <span className="font-medium">{userEmail}</span>
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Course Topic <span className="text-red-500">*</span>
              </label>
              <textarea
                id="topic"
                name="topic"
                value={courseData.topic}
                onChange={handleChange}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the specific topic you want to learn"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Be specific about what you want to learn (e.g., "Neural Networks for Image Recognition" instead of just "Machine Learning")
              </p>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="end_goal" className="block text-sm font-medium text-gray-700 mb-1">
                Learning Goal <span className="text-red-500">*</span>
              </label>
              <textarea
                id="end_goal"
                name="end_goal"
                value={courseData.end_goal}
                onChange={handleChange}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="What do you want to achieve by the end of this course?"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                For example: "Be able to implement a convolutional neural network from scratch" or "Understand and apply advanced calculus concepts to optimization problems"
              </p>
            </div>
            
            <div>
              <label htmlFor="knowledge_level" className="block text-sm font-medium text-gray-700 mb-1">
                Current Knowledge Level
              </label>
              <select
                id="knowledge_level"
                name="knowledge_level"
                value={courseData.knowledge_level}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner - No prior knowledge</option>
                <option value="intermediate">Intermediate - Some familiarity with the topic</option>
                <option value="advanced">Advanced - Strong foundation, looking to deepen knowledge</option>
              </select>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Course Focus
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.focus === 'math-heavy'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'focus', value: 'math-heavy' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Math-focused</h3>
                    {courseData.focus === 'math-heavy' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Emphasis on mathematical theories and proofs</p>
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.focus === 'balanced'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'focus', value: 'balanced' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Balanced</h3>
                    {courseData.focus === 'balanced' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Mix of theory and practical application</p>
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.focus === 'practical'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'focus', value: 'practical' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Practical</h3>
                    {courseData.focus === 'practical' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Focus on hands-on implementation and real-world applications</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Learning Approach
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.approach === 'visual'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'approach', value: 'visual' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Visual</h3>
                    {courseData.approach === 'visual' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Emphasis on diagrams, charts, and visual explanations</p>
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.approach === 'text'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'approach', value: 'text' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Text-based</h3>
                    {courseData.approach === 'text' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Focus on comprehensive written explanations</p>
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.approach === 'both'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'approach', value: 'both' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Combined</h3>
                    {courseData.approach === 'both' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Balanced mix of visual and text-based learning materials</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Your Custom Course</h1>
        <p className="text-gray-600">
          Tell us what you want to learn, and we'll generate a personalized learning path for you.
        </p>
        
        {/* Progress steps */}
        <div className="mt-8 mb-10">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 1 ? <Check size={20} /> : 1}
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 2 ? <Check size={20} /> : 2}
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <div className={step >= 1 ? 'text-blue-500 font-medium' : ''}>Course Basics</div>
            <div className={step >= 2 ? 'text-blue-500 font-medium' : ''}>Learning Goals</div>
            <div className={step >= 3 ? 'text-blue-500 font-medium' : ''}>Preferences</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={step === 3 ? handleSubmit : nextStep}>
          {renderStepContent()}
          
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Back
              </button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                >
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Course'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}