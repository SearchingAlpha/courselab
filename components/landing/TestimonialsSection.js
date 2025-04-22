import Image from 'next/image';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Data Science Student',
    image: '/api/placeholder/80/80',
    quote: 'CourseForge transformed how I learn. The structured approach and interactive exercises helped me master machine learning concepts in weeks instead of months.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    image: '/api/placeholder/80/80',
    quote: 'The project-based approach was exactly what I needed. Each concept built upon the previous one, and the final project tied everything together beautifully.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Mathematics Professor',
    image: '/api/placeholder/80/80',
    quote: 'I\'ve recommended CourseLab to all my students. The depth of material and interactive components create an unparalleled learning experience.',
    rating: 5
  }
];

function TestimonialsSection() {
  return (
    <section className="py-24 bg-white" id="testimonials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Our <span className="text-blue-600">Users Say</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join thousands of learners who have transformed their skills with CourseLab.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                  />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;