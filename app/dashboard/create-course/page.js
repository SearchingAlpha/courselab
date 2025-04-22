'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [courseData, setCourseData] = useState({
    title: '',
    topic: '',
    endGoal: '',
    knowledgeLevel: 'beginner',
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
  const nextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!courseData.title || !courseData.topic) {
        setError('Please fill in all required fields');
        return;
      }
    }
    else if (step === 2) {
      if (!courseData.endGoal) {
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
  
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // This would be an API call to backend
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create course');
      }
      
      // Navigate to the generate-syllabus page with the course ID
      router.push(`/dashboard/courses/${data.id}/generate-syllabus`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.message || 'Something went wrong. Please try again.');
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
              <label htmlFor="endGoal" className="block text-sm font-medium text-gray-700 mb-1">
                Learning Goal <span className="text-red-500">*</span>
              </label>
              <textarea
                id="endGoal"
                name="endGoal"
                value={courseData.endGoal}
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
              <label htmlFor="knowledgeLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Current Knowledge Level
              </label>
              <select
                id="knowledgeLevel"
                name="knowledgeLevel"
                value={courseData.knowledgeLevel}
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
                  <p className="text-sm text-gray-600">Equal focus on theory and implementation</p>
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.focus === 'code-heavy'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'focus', value: 'code-heavy' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Code-focused</h3>
                    {courseData.focus === 'code-heavy' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Emphasis on practical implementation and coding</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Learning Approach
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.approach === 'theory'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'approach', value: 'theory' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Theory</h3>
                    {courseData.approach === 'theory' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Focus on conceptual understanding</p>
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    courseData.approach === 'practice'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'approach', value: 'practice' } })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Practice</h3>
                    {courseData.approach === 'practice' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Focus on hands-on activities</p>
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
                    <h3 className="font-medium">Both</h3>
                    {courseData.approach === 'both' && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Balance of theory and practice</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Course Summary</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{courseData.title}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Topic</p>
                    <p className="font-medium">{courseData.topic}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Learning Goal</p>
                  <p className="font-medium">{courseData.endGoal}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Knowledge Level</p>
                    <p className="font-medium capitalize">{courseData.knowledgeLevel}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Focus</p>
                    <p className="font-medium">
                      {courseData.focus === 'math-heavy' && 'Math-focused'}
                      {courseData.focus === 'balanced' && 'Balanced'}
                      {courseData.focus === 'code-heavy' && 'Code-focused'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Approach</p>
                    <p className="font-medium">
                      {courseData.approach === 'theory' && 'Theory-focused'}
                      {courseData.approach === 'practice' && 'Practice-focused'}
                      {courseData.approach === 'both' && 'Balanced approach'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
              <HelpCircle size={20} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  When you submit, CourseForge will create a structured 120-hour course based on your inputs. 
                  You'll be able to generate a complete syllabus, detailed textbook chapters, interactive exercises, 
                  and a capstone project - all tailored to your specifications.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Course</h1>
        <p className="text-gray-600">
          Define your course requirements to generate a personalized learning path
        </p>
      </div>
      
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`hidden sm:block h-1 w-12 md:w-24 lg:w-32 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-xs text-gray-600">Course Details</div>
          <div className="text-xs text-gray-600">Learning Goals</div>
          <div className="text-xs text-gray-600">Preferences</div>
          <div className="text-xs text-gray-600">Review</div>
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
      
      {/* Form content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
        </form>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className={`px-4 py-2 border rounded-md ${
            step === 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Back
        </button>
        
        <div>
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                'Creating Course...'
              ) : (
                <>
                  Create Course
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}