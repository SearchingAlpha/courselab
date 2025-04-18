'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';

function HeroSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate API call to add to waitlist
    try {
      // Replace with actual API endpoint when available
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg mx-auto lg:mx-0">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Join our waitlist
              </h2>
              
              {isSubmitted ? (
                <div className="text-left p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-800">Thank you for joining!</h3>
                    <p className="text-green-700 mt-1">We'll notify you when CourseForge is ready for you.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Joining...' : 'Join Waitlist'}
                    {!isLoading && <ArrowRight size={16} />}
                  </button>
                </form>
              )}
              
              <p className="mt-4 text-sm text-gray-600">
                Be the first to know when we launch. No spam, ever.
              </p>
            </div>
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