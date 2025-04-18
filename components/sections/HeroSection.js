// components/sections/HeroSection.jsx
import Link from 'next/link';
import Image from 'next/image';
import HeaderMain from '../layout/HeaderMain';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-white to-blue-50">
      <HeaderMain />
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Master Complex Topics with <span className="bg-gradient-to-r from-[#3A86FF] to-[#8338EC] bg-clip-text text-transparent">Structured Learning</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-xl">
              CourseForge helps you master mathematics and programming through AI-generated 120-hour courses with personalized syllabi, textbooks, exercises, and projects.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/#waitlist" 
                className="px-8 py-3 bg-[#3A86FF] text-white rounded-md hover:bg-[#2a75f0] transition-colors text-center text-lg font-medium"
              >
                Join Waitlist
              </Link>
              <Link 
                href="/#how-it-works" 
                className="px-8 py-3 bg-transparent border border-[#3A86FF] text-[#3A86FF] rounded-md hover:bg-blue-50 transition-colors text-center text-lg font-medium"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <Image
                      src={`/avatars/avatar-${i}.jpg`}
                      alt={`User ${i}`}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Trusted by <span className="font-semibold text-gray-900">500+</span> early adopters</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative h-[400px] md:h-[500px] w-full">
              <Image
                src="/images/hero-illustration.svg"
                alt="Interactive learning platform illustration"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white shadow-lg rounded-lg p-4 max-w-xs border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3A86FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Interactive Learning</p>
                  <p className="text-xs text-gray-500">Exercises with real-time feedback</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 bg-white shadow-lg rounded-lg p-4 max-w-xs border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8338EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Custom Courses</p>
                  <p className="text-xs text-gray-500">Tailored to your learning goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}