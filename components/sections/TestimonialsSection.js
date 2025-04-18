// components/sections/TestimonialsSection.jsx
"use client";

import { useState } from 'react';
import Image from 'next/image';

function TestimonialCard({ name, role, image, quote, rating }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image
            src={image}
            alt={name}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-[#FF9F1C]' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      <blockquote className="text-gray-700 italic mb-4 flex-grow">
        "{quote}"
      </blockquote>
    </div>
  );
}

export default function TestimonialsSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Computer Science Student",
      image: "/images/testimonials/alex.jpg",
      quote: "CourseForge helped me master advanced algorithms in a fraction of the time it would have taken with traditional resources. The personalized syllabus and interactive exercises were game-changers for me.",
      rating: 5,
      category: "students"
    },
    {
      name: "Maria Rodriguez",
      role: "Data Scientist",
      image: "/images/testimonials/maria.jpg",
      quote: "As someone transitioning into a more technical role, CourseForge's structured approach to learning mathematics for data science was exactly what I needed. The real-world examples made complex concepts much more accessible.",
      rating: 5,
      category: "professionals"
    },
    {
      name: "David Chen",
      role: "Software Engineer",
      image: "/images/testimonials/david.jpg",
      quote: "The depth of content in CourseForge is impressive. I used it to fill gaps in my mathematical knowledge for machine learning, and the progressive project-based approach solidified my understanding.",
      rating: 4,
      category: "professionals"
    },
    {
      name: "Sarah Williams",
      role: "Mathematics Teacher",
      image: "/images/testimonials/sarah.jpg",
      quote: "CourseForge has transformed how I prepare teaching materials. The clear explanations and visual aids have inspired my own teaching methods, and I've recommended it to many of my advanced students.",
      rating: 5,
      category: "educators"
    },
    {
      name: "James Peterson",
      role: "Physics Major",
      image: "/images/testimonials/james.jpg",
      quote: "I needed to strengthen my programming skills for computational physics. CourseForge created the perfect learning path that integrated mathematical concepts with practical programming applications.",
      rating: 4,
      category: "students"
    },
    {
      name: "Priya Patel",
      role: "Frontend Developer",
      image: "/images/testimonials/priya.jpg",
      quote: "The interactive exercises were instrumental in helping me understand complex algorithms. I appreciate how CourseForge balances theory with hands-on practice.",
      rating: 5,
      category: "professionals"
    }
  ];
  
  const filteredTestimonials = activeCategory === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.category === activeCategory);
  
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Early Users Say</h2>
          <p className="text-lg text-gray-600">
            Hear from students, professionals, and educators who've experienced our beta version.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['all', 'students', 'professionals', 'educators'].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  activeCategory === category
                    ? 'bg-[#3A86FF] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition-colors`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              image={testimonial.image}
              quote={testimonial.quote}
              rating={testimonial.rating}
            />
          ))}
        </div>
        
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100">
                <Image
                  src="/images/testimonials/featured.jpg"
                  alt="Featured testimonial"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className="w-5 h-5 text-[#FF9F1C]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-xl italic text-gray-800 mb-4">
                "CourseForge completely transformed my approach to teaching mathematical programming. The structured methodology and progressive learning path allowed my students to build connections between concepts that they previously struggled with."
              </blockquote>
              <div>
                <p className="font-semibold text-gray-900">Dr. Robert Thorne</p>
                <p className="text-gray-600">Computer Science Professor, MIT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}