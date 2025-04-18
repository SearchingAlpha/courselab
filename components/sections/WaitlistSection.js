// components/sections/WaitlistSection.jsx
"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [interest, setInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Form validation
    if (!email || !name) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // This would be replaced with your actual API endpoint
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      // Reset form
      setEmail('');
      setName('');
      setInterest('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Form Section */}
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Join the Waitlist
                </h2>
                <p className="text-gray-600 mb-8">
                  Be among the first to experience CourseForge when we launch. We'll notify you as soon as access is available.
                </p>

                {isSubmitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Thank you for joining our waitlist!
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>
                            We'll notify you as soon as CourseForge is ready for you. In the meantime, stay tuned for updates!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3A86FF] focus:border-[#3A86FF] outline-none transition"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3A86FF] focus:border-[#3A86FF] outline-none transition"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">
                        What topics are you most interested in learning? (Optional)
                      </label>
                      <textarea
                        id="interest"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3A86FF] focus:border-[#3A86FF] outline-none transition"
                        placeholder="E.g., Machine Learning, Algorithms, Linear Algebra, Web Development..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full px-6 py-3 bg-[#3A86FF] text-white rounded-md font-medium transition-colors ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#2a75f0]'
                      }`}
                    >
                      {isSubmitting ? 'Joining Waitlist...' : 'Join Waitlist'}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                      By signing up, you agree to our{' '}
                      <a href="#" className="text-[#3A86FF] hover:underline">
                        Privacy Policy
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-[#3A86FF] hover:underline">
                        Terms of Service
                      </a>
                      .
                    </p>
                  </form>
                )}
              </div>
              
              {/* Image/Stats Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-12 flex items-center">
                <div>
                  <div className="mb-8 relative h-40 md:h-48">
                    <Image
                      src="/images/waitlist-illustration.svg"
                      alt="Join CourseForge Waitlist"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Why Join the Waitlist?
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#3A86FF] flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700">Early access to the platform</p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#3A86FF] flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700">Special founder's discount</p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#3A86FF] flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700">Exclusive beta features</p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#3A86FF] flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700">Shape the product with your feedback</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-[#3A86FF]">500+</p>
                        <p className="text-sm text-gray-600">Users Waitlisted</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-[#FF9F1C]">92%</p>
                        <p className="text-sm text-gray-600">Satisfaction Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-[#8338EC]">20+</p>
                        <p className="text-sm text-gray-600">Course Topics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}