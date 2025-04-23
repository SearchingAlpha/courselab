'use client';

import { useState } from 'react';
import { streamContent } from '@/lib/streaming';

export default function SyllabusGenerator({ courseId }) {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setContent('');

    try {
      await streamContent(
        `/api/courses/${courseId}/syllabus`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        (token) => {
          setContent((prev) => prev + token);
        },
        () => {
          setIsGenerating(false);
        },
        (error) => {
          setError(error);
          setIsGenerating(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Course Syllabus</h2>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Syllabus'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {content && (
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
} 