'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SyllabusPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  
  useEffect(() => {
    // Redirect to generate-syllabus page
    router.replace(`/dashboard/courses/${courseId}/generate-syllabus`);
  }, [courseId, router]);
  
  return null; // No need to render anything as we're redirecting
} 