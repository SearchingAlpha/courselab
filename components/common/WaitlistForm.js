'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

function WaitlistForm({ buttonText = 'Join Waitlist', className = '' }) {
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
    <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
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
            <p className="text-green-700 mt-1">We&apos;ll notify you when CourseLab is ready for you.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="waitlist-email" className="block text-sm font-medium text-gray-700 text-left mb-1">
              Email address
            </label>
            <input
              type="email"
              id="waitlist-email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
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
            {isLoading ? 'Joining...' : buttonText}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>
      )}
      
      <p className="mt-4 text-sm text-gray-600">
        Be the first to know when we launch. No spam, ever.
      </p>
    </div>
  );
}

export default WaitlistForm;