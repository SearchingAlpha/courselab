// components/sections/HowItWorksSection.jsx
import Image from 'next/image';

function StepCard({ number, title, description, imageUrl, isActive = false }) {
  return (
    <div className={`relative p-6 rounded-xl ${isActive ? 'bg-white shadow-md border border-blue-100' : 'bg-transparent'}`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${isActive ? 'bg-[#3A86FF] text-white' : 'bg-blue-100 text-[#3A86FF]'}`}>
          {number}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          
          <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Define Your Course",
      description: "Specify your topic, goals, current knowledge level, and preferences for a personalized learning experience.",
      imageUrl: "/images/define-course.svg",
      isActive: true
    },
    {
      number: 2,
      title: "Generate Syllabus",
      description: "Receive a comprehensive 120-hour syllabus divided into modules that progressively build toward your learning goals.",
      imageUrl: "/images/syllabus.svg"
    },
    {
      number: 3,
      title: "Study Textbook Content",
      description: "Access detailed chapter-by-chapter explanations with real-world examples, visual aids, and in-depth concept coverage.",
      imageUrl: "/images/textbook.svg"
    },
    {
      number: 4,
      title: "Complete Interactive Exercises",
      description: "Reinforce learning through guided exercises, independent challenges, and practical applications in a Jupyter-like environment.",
      imageUrl: "/images/exercises.svg"
    },
    {
      number: 5,
      title: "Build Your Final Project",
      description: "Apply everything you've learned in a comprehensive capstone project that demonstrates your mastery of the subject.",
      imageUrl: "/images/project.svg"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How CourseForge Works</h2>
          <p className="text-lg text-gray-600">
            A simple, structured process to create your personalized learning journey from start to finish.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line connecting steps */}
          <div className="absolute top-0 bottom-0 left-[33px] md:left-[37px] w-0.5 bg-blue-100 hidden md:block"></div>
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                imageUrl={step.imageUrl}
                isActive={step.isActive}
              />
            ))}
          </div>
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