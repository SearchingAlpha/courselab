// components/diagrams/LearningPathDiagram.jsx
"use client";

import { useState, useEffect } from 'react';

const LearningPathDiagram = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Auto-cycle through steps for animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 5);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      keyword: "define-course",
      title: "Define Your Course",
      description: "Specify your topic, learning goals and knowledge level",
      code: `> define-course
topic: "Advanced Machine Learning"
goal: "Implement ML models from scratch"
level: "Intermediate"
focus: "balanced"
approach: "theory+practice"
`
    },
    {
      keyword: "generate-syllabus",
      title: "Generate Syllabus",
      description: "Create a structured 120-hour learning path",
      code: `> generate-syllabus
Generating comprehensive syllabus...
✓ Module 1: Foundations (15h)
✓ Module 2: Linear Models (20h)
✓ Module 3: Neural Networks (25h)
✓ Module 4: Unsupervised Learning (20h)
✓ Module 5: Advanced Topics (25h)
✓ Final Project (15h)
`
    },
    {
      keyword: "generate-textbook",
      title: "Create Textbook Chapters",
      description: "Learn through detailed explanations with examples",
      code: `> generate-textbook
Creating chapter: Neural Networks...
✓ 3.1 Perceptrons and Activation Functions
✓ 3.2 Backpropagation Algorithm
✓ 3.3 Gradient Descent Optimization
✓ 3.4 Implementation from Scratch
> next-chapter
`
    },
    {
      keyword: "generate-exercises",
      title: "Practice with Exercises",
      description: "Reinforce learning with interactive problems",
      code: `> generate-exercises
Creating Jupyter notebook...
✓ Exercise 1: Implement a simple neural network
✓ Exercise 2: Train the model on MNIST dataset
✓ Exercise 3: Visualize decision boundaries
✓ Challenge: Optimize the network architecture
`
    },
    {
      keyword: "generate-project",
      title: "Build Capstone Project",
      description: "Apply knowledge to a comprehensive project",
      code: `> generate-project
Creating project structure...
✓ Project overview: Image classification system
✓ Data preprocessing module
✓ Model implementation
✓ Evaluation metrics
✓ Deployment strategy
✓ Documentation
`
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left column: Steps navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Path Keywords</h3>
          
          <div className="space-y-4 mb-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                  currentStep === index 
                    ? 'bg-blue-50 border-l-4 border-[#3A86FF]' 
                    : 'bg-gray-50 hover:bg-blue-50'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  currentStep === index 
                    ? 'bg-[#3A86FF] text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-mono text-sm text-[#3A86FF] font-semibold">{step.keyword}</div>
                  <div className="text-sm text-gray-600">{step.title}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={() => setCurrentStep(prev => (prev - 1 + steps.length) % steps.length)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm transition-colors"
            >
              Previous
            </button>
            
            <div className="text-center text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
            
            <button 
              onClick={() => setCurrentStep(prev => (prev + 1) % steps.length)}
              className="px-4 py-2 bg-[#3A86FF] hover:bg-[#2a75f0] rounded-md text-white text-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>
        
        {/* Right column: Code display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">{steps[currentStep].title}</h3>
            <p className="text-gray-600 text-sm">{steps[currentStep].description}</p>
          </div>
          
          <div className="p-5">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="text-gray-500 text-xs font-mono">terminal</div>
              </div>
              
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-800 text-green-400 p-3 rounded-md">
                {steps[currentStep].code}
                <span className="inline-block w-2 h-4 bg-gray-300 ml-1 animate-pulse"></span>
              </pre>
            </div>
            
            {/* Visual indicator for the current step */}
            <div className="mt-6 flex gap-1 justify-center">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentStep === index ? 'bg-[#3A86FF]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDiagram;