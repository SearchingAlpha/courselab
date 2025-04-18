import { BookOpen, Code, Layout, BookType, LineChart, Star } from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="w-10 h-10 text-blue-600" />,
    title: 'Comprehensive Syllabus',
    description: 'Each course features a detailed 120-hour syllabus with clear learning paths and progressive topics.'
  },
  {
    icon: <BookType className="w-10 h-10 text-blue-600" />,
    title: 'In-depth Textbooks',
    description: 'Detailed theoretical guides with real-life examples, visual aids, and mathematical explanations.'
  },
  {
    icon: <Code className="w-10 h-10 text-blue-600" />,
    title: 'Interactive Exercises',
    description: 'Practice with Jupyter notebooks featuring guided examples and independent projects to test your knowledge.'
  },
  {
    icon: <Layout className="w-10 h-10 text-blue-600" />,
    title: 'Project-Based Learning',
    description: 'Apply your skills with real-world capstone projects broken down into manageable components.'
  },
  {
    icon: <LineChart className="w-10 h-10 text-blue-600" />,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with visual progress indicators and achievement milestones.'
  },
  {
    icon: <Star className="w-10 h-10 text-blue-600" />,
    title: 'Personalized Courses',
    description: 'Courses tailored to your knowledge level, learning style, and specific goals.'
  }
];

function FeaturesSection() {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Learn How <span className="text-blue-600">You Want</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            CourseForge combines comprehensive theory with hands-on practice to create the most effective learning experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="mb-5">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;