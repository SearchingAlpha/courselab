'use client';

import WaitlistForm from '@/components/common/WaitlistForm';

function CtaSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700 text-white" id="join-waitlist">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join our waitlist today and be the first to experience the future of personalized education with CourseLab.
          </p>
          
          <WaitlistForm className="max-w-lg mx-auto" buttonText="Join Waitlist" />
          
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