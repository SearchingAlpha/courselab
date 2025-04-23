'use client';

import { useState } from 'react';
import { streamContent } from '@/lib/streaming';

export default function TextbookGenerator({ courseId, initialTopic = '' }) {
  const [topic, setTopic] = useState(initialTopic);
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setContent('');

    try {
      await streamContent(
        '/api/textbook',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId,
            topic,
          }),
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
      <form onSubmit={handleGenerate} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter chapter topic"
            className="flex-1 p-2 border rounded-md"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !topic}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Chapter'}
          </button>
        </div>
      </form>

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