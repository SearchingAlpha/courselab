'use client';

import { useState } from 'react';
import SyllabusGenerator from '@/components/syllabus/SyllabusGenerator';
import { use } from 'react';

export default function GenerateSyllabusPage({ params }) {
  const resolvedParams = use(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate Course Syllabus</h1>
        <SyllabusGenerator courseId={resolvedParams.id} />
      </div>
    </div>
  );
} 