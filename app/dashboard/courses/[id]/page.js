'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  
  useEffect(() => {
    // Redirect to the syllabus page by default
    router.push(`/dashboard/courses/${courseId}/syllabus`);
  }, [courseId, router]);
  
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader size={32} className="animate-spin text-blue-600" />
    </div>
  );
} 