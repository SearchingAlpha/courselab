'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

function CtaSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700 text-white" id="join-waitlist">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join our waitlist today and be the first to experience the future of personalized education with CourseForge.
          </p>
          
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">
              Join the Waitlist
            </h3>
            
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
                  <label htmlFor="cta-email" className="block text-sm font-medium text-gray-700 text-left mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="cta-email"
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
              Limited spots available for early access.
            </p>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-blue-100">
            <p>🔒 No credit card required</p>
            <span className="hidden sm:inline">•</span>
            <p>🚀 Early access to new features</p>
            <span className="hidden sm:inline">•</span>
            <p>📧 Unsubscribe anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;