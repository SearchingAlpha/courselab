// components/landing/HeroSection.jsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import WaitlistForm from '@/components/common/WaitlistForm';
import DashboardHeroAnimation from '@/components/landing/DashboardHeroAnimation';

function HeroSection() {
  const [isFormVisible, setIsFormVisible] = useState(false);

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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button 
                onClick={() => setIsFormVisible(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Join the Waitlist
              </button>
              <a 
                href="#how-it-works" 
                className="px-8 py-3 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-lg font-medium"
              >
                How It Works
              </a>
            </div>
            
            {isFormVisible && (
              <div className="lg:max-w-md">
                <WaitlistForm buttonText="Get Early Access" />
              </div>
            )}
          </div>
          
          {/* Right side - Dashboard Animation */}
          <div className="w-full lg:w-1/2 mt-6 lg:mt-0">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <DashboardHeroAnimation />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;