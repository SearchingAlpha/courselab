'use client';

import { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import SyllabusGenerator from '@/components/syllabus/SyllabusGenerator';

export default function GenerateSyllabusPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getUser();
        
        if (!currentUser) {
          router.push('/auth/signin');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate Course Syllabus</h1>
        <SyllabusGenerator courseId={params.id} />
      </div>
    </div>
  );
} 