import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">CourseForge</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Transforming education through AI-generated, structured courses in mathematics and programming.
            </p>
            <div className="flex gap-4">
              <Link href="https://twitter.com" className="text-gray-400 hover:text-white transition">
                <Twitter size={20} />
              </Link>
              <Link href="https://github.com" className="text-gray-400 hover:text-white transition">
                <Github size={20} />
              </Link>
              <Link href="https://linkedin.com" className="text-gray-400 hover:text-white transition">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-400 hover:text-white transition">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-400 hover:text-white transition">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#join-waitlist" className="text-gray-400 hover:text-white transition">
                  Join Waitlist
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} CourseLab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;