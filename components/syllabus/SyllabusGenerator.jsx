'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiFileText, FiDownload, FiRefreshCw, FiCheck, FiSearch, FiClock, FiChevronDown, FiChevronRight, FiCalendar, FiActivity, FiBook, FiLayers, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SyllabusGenerator({ courseId }) {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    fetchExistingSyllabus();
  }, [courseId]);

  const fetchExistingSyllabus = async () => {
    try {
      const { data: syllabus, error } = await supabase
        .from('syllabus')
        .select('*')
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (syllabus) {
        setContent(syllabus.content);
      }
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      toast.error('Failed to fetch syllabus');
      setError('Failed to fetch syllabus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    const isRegenerating = content ? true : false;
    setAnalysis('');

    try {
      const url = isRegenerating 
        ? `/api/courses/${courseId}/syllabus?regenerate=true` 
        : `/api/courses/${courseId}/syllabus`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate syllabus');
      }

      const data = await response.json();
      setContent(data.content);
      setExpandedSections({});
      toast.success(isRegenerating ? 'Syllabus regenerated!' : 'Syllabus generated!');
    } catch (err) {
      console.error('Error generating syllabus:', err);
      toast.error('Failed to generate syllabus');
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');
    setAnalysis('');

    try {
      const response = await fetch(`/api/courses/${courseId}/syllabus?analyze=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to analyze syllabus');
      }

      const analysisText = await response.text();
      setAnalysis(analysisText);
      setActiveTab('analysis');
      toast.success('Analysis complete!');
    } catch (err) {
      console.error('Error analyzing syllabus:', err);
      toast.error('Failed to analyze syllabus');
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'syllabus.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Syllabus downloaded!');
    } catch (err) {
      console.error('Error downloading syllabus:', err);
      toast.error('Failed to download syllabus');
    }
  };

  // Parse the content to extract sections for collapsible viewing
  const parsedSections = useMemo(() => {
    if (!content) return [];

    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];
    let moduleIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Parse module sections (## Course Structure)
      if (line.startsWith('## Course Structure')) {
        if (currentSection) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n')
          });
        }
        currentSection = { 
          id: 'course-structure',
          title: line.replace('##', '').trim(),
          level: 2,
          isModule: false,
          icon: <FiLayers className="w-5 h-5" />
        };
        currentContent = [line];
      }
      // Parse module headers (### Module 1, etc)
      else if (line.match(/^### Module \d+/)) {
        if (currentSection) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n')
          });
        }
        moduleIndex++;
        currentSection = { 
          id: `module-${moduleIndex}`,
          title: line.replace('###', '').trim(),
          level: 3,
          isModule: true,
          // Extract time allocation if present
          timeAllocation: line.includes('(') && line.includes(')') 
            ? line.substring(line.indexOf('(') + 1, line.indexOf(')')) 
            : null,
          icon: <FiBook className="w-5 h-5" />
        };
        currentContent = [line];
      }
      // Parse other major sections
      else if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n')
          });
        }
        const sectionId = line.replace('##', '').trim().toLowerCase().replace(/\s+/g, '-');
        let icon = <FiFileText className="w-5 h-5" />;
        
        if (line.includes('Learning Objectives')) icon = <FiActivity className="w-5 h-5" />;
        else if (line.includes('Assessment')) icon = <FiSearch className="w-5 h-5" />;
        else if (line.includes('Final Project')) icon = <FiLayers className="w-5 h-5" />;
        else if (line.includes('Prerequisites')) icon = <FiCalendar className="w-5 h-5" />;
        
        currentSection = { 
          id: sectionId,
          title: line.replace('##', '').trim(),
          level: 2,
          isModule: false,
          icon
        };
        currentContent = [line];
      }
      else {
        currentContent.push(line);
      }
    }
    
    // Don't forget to add the last section
    if (currentSection) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n')
      });
    }
    
    return sections;
  }, [content]);

  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Extract the time allocations to calculate timeline
  const timelineData = useMemo(() => {
    return parsedSections.filter(section => section.isModule).map(module => ({
      id: module.id,
      title: module.title,
      timeAllocation: module.timeAllocation || 'N/A',
      // Extract hours as number for width calculation
      hours: parseInt(module.timeAllocation?.match(/(\d+)\s*hours/) || [0, 10])[1]
    }));
  }, [parsedSections]);

  // Total course hours for timeline calculation
  const totalHours = useMemo(() => {
    return timelineData.reduce((total, module) => total + module.hours, 0) || 120;
  }, [timelineData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <FiFileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 font-mono">Course Syllabus</h2>
            </div>
            <div className="flex items-center space-x-4">
              {content && (
                <>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || isGenerating}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <FiRefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FiSearch className="-ml-1 mr-2 h-5 w-5" />
                        Analyze
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiDownload className="-ml-1 mr-2 h-5 w-5" />
                    Download
                  </button>
                </>
              )}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || isAnalyzing}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isGenerating ? (
                  <>
                    <FiRefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Generating...
                  </>
                ) : content ? (
                  <>
                    <FiRefreshCw className="-ml-1 mr-2 h-5 w-5" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <FiFileText className="-ml-1 mr-2 h-5 w-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Tabs */}
          {content && (
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`${
                    activeTab === 'content'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Content
                </button>
                {analysis && (
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`${
                      activeTab === 'analysis'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Analysis
                  </button>
                )}
              </nav>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'content' && content && (
                <div className="space-y-6">
                  {parsedSections.map((section) => (
                    <div 
                      key={section.id} 
                      className={`border rounded-md ${section.level === 2 ? 'border-gray-300 bg-gray-50' : 'border-gray-200'}`}
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex justify-between items-center p-4 text-left ${section.level === 2 ? 'font-bold' : 'font-medium'}`}
                      >
                        <div className="flex items-center space-x-3">
                          {section.icon}
                          <span className="font-mono">{section.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {section.isModule && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FiClock className="mr-1 h-3 w-3" />
                              {section.timeAllocation || 'N/A'}
                            </span>
                          )}
                          {expandedSections[section.id] ? (
                            <FiChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FiChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedSections[section.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-gray-200 prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap font-mono text-sm">
                                {section.content}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'analysis' && analysis && (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                    {analysis}
                  </pre>
                </div>
              )}

              {!content && !isGenerating && !error && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 bg-gray-50">
                  <FiFileText className="w-12 h-12 mb-4" />
                  <p className="text-lg font-mono">No syllabus generated yet</p>
                  <p className="text-sm font-mono">Click the Generate button to create a syllabus</p>
                  <div className="mt-6 bg-black bg-opacity-5 p-4 rounded-md border border-gray-300 w-2/3 max-w-md font-mono text-sm">
                    <div className="flex items-center text-blue-600 mb-2">
                      <span className="mr-2">$</span> generate-syllabus
                    </div>
                    <div className="text-gray-600">// Generates a comprehensive course syllabus based on your course settings</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
} 