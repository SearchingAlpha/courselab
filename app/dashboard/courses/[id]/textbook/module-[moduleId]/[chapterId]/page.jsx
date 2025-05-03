'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Loader, AlertCircle, BookOpen } from 'lucide-react';
import TextbookViewer from '@/components/textbook/TextbookViewer';
import Link from 'next/link';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TextbookChapterPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  const moduleId = params.moduleId;
  const chapterId = params.chapterId;
  
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prevChapter, setPrevChapter] = useState(null);
  const [nextChapter, setNextChapter] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  
  // Fetch chapter content
  useEffect(() => {
    async function fetchChapter() {
      setIsLoading(true);
      setError('');
      
      try {
        // Get current session token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('No authentication token available. Please try logging in again.');
        }
        
        const response = await fetch(
          `/api/courses/${courseId}/textbook/${moduleId}/${chapterId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            // Chapter not found, need to generate it
            return await generateChapter();
          }
          throw new Error('Failed to fetch chapter data');
        }
        
        const data = await response.json();
        setChapter(data.chapter);
        setPrevChapter(data.prevChapter);
        setNextChapter(data.nextChapter);
        setAllChapters(data.allChapters);
      } catch (err) {
        console.error('Error fetching chapter:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchChapter();
  }, [courseId, moduleId, chapterId]);
  
  // Function to generate a new chapter
  const generateChapter = async () => {
    setIsGenerating(true);
    
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available. Please try logging in again.');
      }
      
      // Call the generate API
      const response = await fetch(
        `/api/courses/${courseId}/textbook/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            moduleId,
            chapterId,
            // Add parameter to indicate if this is a 'next-chapter' command
            nextChapterCommand: true
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to generate chapter');
      }
      
      const data = await response.json();
      
      // Now fetch the full chapter data with navigation
      const fullResponse = await fetch(
        `/api/courses/${courseId}/textbook/${moduleId}/${chapterId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      
      if (!fullResponse.ok) {
        throw new Error('Failed to fetch chapter data after generation');
      }
      
      const fullData = await fullResponse.json();
      setChapter(fullData.chapter);
      setPrevChapter(fullData.prevChapter);
      setNextChapter(fullData.nextChapter);
      setAllChapters(fullData.allChapters);
    } catch (err) {
      console.error('Error generating chapter:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle manual generation/regeneration
  const handleGenerateChapter = async () => {
    setError('');
    await generateChapter();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading chapter...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
          <div className="flex items-start">
            <AlertCircle size={24} className="text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-medium">An error occurred</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center mt-8">
          <BookOpen size={48} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Chapter not available</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            The requested chapter could not be loaded. You can try generating it manually.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={handleGenerateChapter}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isGenerating ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Chapter'
              )}
            </button>
            
            <Link
              href={`/dashboard/courses/${courseId}/chapters`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back to Chapters
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Generating Chapter</h2>
          <p className="text-gray-600">
            Please wait while we create your chapter content...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This may take a minute or two depending on the complexity.
          </p>
        </div>
      </div>
    );
  }
  
  if (!chapter) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-4">Chapter not found</h2>
        <p className="text-gray-600 mb-6">
          This chapter doesn't exist yet. Would you like to generate it?
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGenerateChapter}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Generate Chapter
          </button>
          
          <Link
            href={`/dashboard/courses/${courseId}/chapters`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Chapters
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <TextbookViewer
      courseId={courseId}
      moduleId={moduleId}
      chapterId={chapterId}
      title={chapter.title}
      content={chapter.content}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
      allChapters={allChapters}
    />
  );
} 