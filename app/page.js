// app/page.jsx
import Navbar from '@/components/common/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/common/Footer';

export const metadata = {
  title: 'CourseForge - Master Complex Topics with AI-Generated Courses',
  description: 'CourseForge helps you master complex topics in mathematics and programming through structured 120-hour courses with interactive exercises and project-based learning.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection /> {/* The updated HeroSection with the dashboard animation */}
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </main>
  );
}