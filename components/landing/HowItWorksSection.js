import Image from 'next/image';
import LearningPath from '@/public/landing/learning-path.png'
import { MessageSquare, Book, FileText, Code, BarChart } from 'lucide-react';

const steps = [
  {
    icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
    title: 'Define Your Course',
    description: 'Start by telling us what you want to learn, your goals, and your current knowledge level.',
    keyword: 'define-course'
  },
  {
    icon: <FileText className="w-8 h-8 text-blue-600" />,
    title: 'Generate Syllabus',
    description: 'Our AI creates a structured 120-hour course syllabus tailored to your needs.',
    keyword: 'generate-syllabus'
  },
  {
    icon: <Book className="w-8 h-8 text-blue-600" />,
    title: 'Study Theory',
    description: 'Learn from detailed textbooks with real-world examples and visual explanations.',
    keyword: 'generate-textbook'
  },
  {
    icon: <Code className="w-8 h-8 text-blue-600" />,
    title: 'Practice Skills',
    description: 'Solidify your knowledge with interactive exercises and coding challenges.',
    keyword: 'generate-exercises'
  },
  {
    icon: <BarChart className="w-8 h-8 text-blue-600" />,
    title: 'Complete Projects',
    description: 'Apply what you\'ve learned to real-world projects that showcase your new skills.',
    keyword: 'generate-project'
  }
];

function HowItWorksSection() {
  return (
    <section className="py-24 bg-gray-50" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How <span className="text-blue-600">CourseForge</span> Works
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Our keyword-driven system creates a structured learning path that takes you from beginner to expert.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-5 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <div className="px-2 py-1 rounded-md bg-gray-100 text-xs font-mono text-gray-600">
                      {step.keyword}
                    </div>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right side - Illustration */}
          <div className="relative h-96 lg:h-[550px] w-full rounded-xl overflow-hidden shadow-lg">
            <Image 
              src= {LearningPath}
              alt="CourseLab Learning Path"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;