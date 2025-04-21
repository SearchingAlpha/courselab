// components/sections/HowItWorksSection.jsx
import LearningPathDiagram from '@/components/landing/LearningPathDiagram';

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How CourseForge Works</h2>
          <p className="text-lg text-gray-600">
            A simple, structured process to create your personalized learning journey from start to finish.
          </p>
        </div>

        <div className="mb-16">
          <LearningPathDiagram />
        </div>

        <div className="relative">
          {/* Vertical line connecting steps */}
          <div className="absolute top-0 bottom-0 left-[33px] md:left-[37px] w-0.5 bg-blue-100 hidden md:block"></div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block p-4 bg-blue-50 rounded-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#3A86FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Learning?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            CourseForge is currently in development. Join our waitlist to be among the first to experience this revolutionary learning platform.
          </p>
          <a 
            href="#waitlist" 
            className="inline-block px-8 py-3 bg-[#3A86FF] text-white rounded-md hover:bg-[#2a75f0] transition-colors text-lg font-medium"
          >
            Join the Waitlist
          </a>
        </div>
      </div>
    </section>
  );
}