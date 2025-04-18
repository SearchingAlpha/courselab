// components/layout/HeaderMain.jsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function HeaderMain() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.svg"
              alt="CourseForge Logo"
              fill
              sizes="(max-width: 768px) 30px, 40px"
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#3A86FF] to-[#8338EC] bg-clip-text text-transparent">
            CourseForge
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/#features" className="text-gray-700 hover:text-[#3A86FF] transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-gray-700 hover:text-[#3A86FF] transition-colors">
            How It Works
          </Link>
          <Link href="/#testimonials" className="text-gray-700 hover:text-[#3A86FF] transition-colors">
            Testimonials
          </Link>
          <Link 
            href="/#waitlist" 
            className="px-5 py-2 bg-[#3A86FF] text-white rounded-md hover:bg-[#2a75f0] transition-colors"
          >
            Join Waitlist
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-4 py-3">
            <Link 
              href="/#features" 
              className="text-gray-700 hover:text-[#3A86FF] transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/#how-it-works" 
              className="text-gray-700 hover:text-[#3A86FF] transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/#testimonials" 
              className="text-gray-700 hover:text-[#3A86FF] transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link 
              href="/#waitlist" 
              className="px-5 py-2 bg-[#3A86FF] text-white rounded-md hover:bg-[#2a75f0] transition-colors inline-block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}