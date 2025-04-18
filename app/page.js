// app/page.js
// Main landing page (Server Component)
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import WaitlistSection from '@/components/sections/WaitlistSection';
import FooterMain from '@/components/layout/FooterMain';

export const metadata = {
  title: 'CourseForge - Interactive Learning Platform for Mathematics and Programming',
  description: 'Master complex topics in mathematics and programming through structured 120-hour courses with customized syllabi, textbooks, exercises and projects.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <WaitlistSection />
      <FooterMain />
    </main>
  );
}