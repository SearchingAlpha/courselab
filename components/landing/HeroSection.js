'use client';

import Image from 'next/image';
import WaitlistForm from '@/components/common/WaitlistForm';

function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-white to-blue-50">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-100 opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-orange-100 opacity-30"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-purple-100 opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Left side - Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Master complex topics with 
              <span className="text-blue-600"> AI-generated courses</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto lg:mx-0">
              Learn mathematics and programming through structured 120-hour courses with interactive exercises, comprehensive theory, and project-based learning.
            </p>
            
            {/* Waitlist Form */}
            <WaitlistForm className="max-w-lg mx-auto lg:mx-0" />
          </div>
          
          {/* Right side - Illustration */}
          <div className="w-full lg:w-1/2">
            <div className="relative h-96 sm:h-[450px] w-full">
              <Image 
                src="/api/placeholder/600/500"
                alt="CourseForge Platform Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">Trusted by educators from</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-70">
            {['MIT', 'Stanford', 'Harvard', 'Berkeley', 'Oxford'].map((university) => (
              <span key={university} className="text-lg font-semibold text-gray-700">
                {university}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;