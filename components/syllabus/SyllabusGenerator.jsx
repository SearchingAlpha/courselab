'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [authDiagnostics, setAuthDiagnostics] = useState(null);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const logCount = useRef(0);

  // Custom debug function
  const debug = (message) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 20)); // Keep most recent 20 logs
    logCount.current += 1;
  };

  useEffect(() => {
    // Force client-side detection
    debug(`Client-side component mounted with courseId: ${courseId}`);
    debug(`Browser detected: ${navigator.userAgent}`);
    
    // Check if this is a page refresh
    if (performance.navigation && performance.navigation.type === 1) {
      debug('This is a page refresh/reload');
    }
    
    // Check if localStorage works
    try {
      localStorage.setItem('test-key', 'test-value');
      debug('localStorage is working');
    } catch (e) {
      debug(`localStorage error: ${e.message}`);
    }
    
    // Immediate check for localStorage cache to show content faster
    try {
      debug('Checking localStorage for cached syllabus on mount');
      const cachedSyllabus = localStorage.getItem(`syllabus-${courseId}`);
      if (cachedSyllabus) {
        debug('Found cached data in localStorage');
        const parsedCache = JSON.parse(cachedSyllabus);
        if (parsedCache && parsedCache.content) {
          debug(`Cached content found: ${parsedCache.content.length} chars`);
          setContent(parsedCache.content);
        } else {
          debug('Cached data exists but has no content property');
        }
      } else {
        debug('No cached syllabus found in localStorage');
      }
    } catch (cacheErr) {
      debug(`Error reading from localStorage: ${cacheErr.message}`);
    }
    
    // Continue with normal fetch process
    fetchExistingSyllabus();
  }, [courseId]);

  const fetchExistingSyllabus = async () => {
    console.log(`Debug: Starting fetchExistingSyllabus for courseId: ${courseId}`);
    debug(`Starting fetchExistingSyllabus for courseId: ${courseId}`);
    setError(''); // Clear any previous errors
    
    try {
      // First, check localStorage for immediate feedback
      try {
        const cachedSyllabus = localStorage.getItem(`syllabus-${courseId}`);
        console.log(`Debug: Cached syllabus from localStorage:`, cachedSyllabus ? 'Found' : 'Not found');
        if (cachedSyllabus) {
          const parsedCache = JSON.parse(cachedSyllabus);
          if (parsedCache && parsedCache.content) {
            console.log(`Debug: Setting content from localStorage: ${parsedCache.content.length} chars`);
            debug('Setting content from localStorage while waiting for API');
            setContent(parsedCache.content);
          }
        }
      } catch (cacheErr) {
        console.log(`Debug: Error reading from localStorage:`, cacheErr);
        debug(`Error reading from localStorage: ${cacheErr.message}`);
      }
      
      // Follow the same auth flow as the generate button
      debug('Getting auth token for API request');
      console.log('Debug: Getting auth token for API request');
      
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      let accessToken = null;
      
      // If session exists, use its token
      if (session?.access_token) {
        accessToken = session.access_token;
        console.log('Debug: Using existing session token');
        debug('Using existing session token');
      } 
      // If no session, try to refresh it
      else {
        console.log('Debug: No session found, attempting to refresh');
        debug('No session found, attempting to refresh');
        // Try refreshing the session
        await supabase.auth.refreshSession();
        // Check again after refresh
        const { data: refreshData } = await supabase.auth.getSession();
        if (refreshData.session?.access_token) {
          accessToken = refreshData.session.access_token;
          console.log('Debug: Got token from session refresh');
          debug('Got token from session refresh');
        }
        // If still no token, try to extract it directly from the cookie
        else {
          console.log('Debug: No token after refresh, trying cookie extraction');
          debug('No token after refresh, trying cookie extraction');
          try {
            const cookieStr = document.cookie;
            console.log(`Debug: Cookie string:`, cookieStr);
            debug(`Cookie string: ${cookieStr.substring(0, 50)}...`);
            const tokenCookie = cookieStr.split(';')
              .map(c => c.trim())
              .find(c => c.startsWith('sb-wwgcghsoogmsmpeseszw-auth-token='));
            
            if (tokenCookie) {
              console.log('Debug: Found auth cookie, attempting to parse');
              debug('Found auth cookie, attempting to parse');
              const tokenValue = decodeURIComponent(tokenCookie.split('=')[1]);
              // Token is stored as JSON array, we need to extract the token string
              const tokenParts = JSON.parse(tokenValue);
              if (tokenParts && tokenParts[0]) {
                accessToken = tokenParts[0];
                console.log('Debug: Got token from cookie');
                debug('Got token from cookie');
              }
            } else {
              console.log('Debug: No matching auth cookie found');
              debug('No matching auth cookie found');
            }
          } catch (e) {
            console.log(`Debug: Error extracting token from cookie:`, e);
            debug(`Error extracting token from cookie: ${e.message}`);
          }
        }
      }
      
      if (!accessToken) {
        console.log('Debug: No auth token available. Relying on localStorage content only.');
        debug('No auth token available. Relying on localStorage content only.');
        return;
      }
      
      // Make the API call - same as in generate function
      console.log(`Debug: Making GET request to /api/courses/${courseId}/syllabus`);
      debug(`Making GET request to /api/courses/${courseId}/syllabus`);
      const response = await fetch(`/api/courses/${courseId}/syllabus`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log(`Debug: API response status:`, response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Debug: No syllabus found (404 response)');
          debug('No syllabus found (404 response)');
          return; // Not an error, just no syllabus yet
        }
        
        // Try to get more detailed error message
        let errorText = '';
        try {
          errorText = await response.text();
          console.log(`Debug: Error response body:`, errorText);
          debug(`Error response body: ${errorText}`);
        } catch (e) {
          console.log(`Debug: Could not read error response:`, e);
          debug(`Could not read error response: ${e.message}`);
        }
        
        throw new Error(`Failed to fetch syllabus: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }
      
      console.log('Debug: Syllabus API request successful');
      debug('Syllabus API request successful');
      const data = await response.json();
      console.log(`Debug: Received data:`, data);
      debug(`Received data structure: ${Object.keys(data).join(', ')}`);
      
      if (!data.content) {
        console.log('Debug: Response successful but no content field found in response');
        debug('Response successful but no content field found in response');
        return;
      }
      
      console.log(`Debug: Content received: ${data.content.length} characters`);
      debug(`Content received: ${data.content.length} characters`);
      
      // Cache the successful response
      try {
        localStorage.setItem(`syllabus-${courseId}`, JSON.stringify(data));
        console.log('Debug: Stored syllabus in localStorage cache');
        debug('Stored syllabus in localStorage cache');
      } catch (storageErr) {
        console.log(`Debug: Error storing in localStorage:`, storageErr);
        debug(`Error storing in localStorage: ${storageErr.message}`);
      }
      
      setContent(data.content);
      console.log('Debug: Updated component state with syllabus content');
      debug('Updated component state with syllabus content');
    } catch (error) {
      console.log(`Debug: Exception in fetchExistingSyllabus:`, error);
      debug(`Exception in fetchExistingSyllabus: ${error.message}`);
      // Don't show error toast if we have content from localStorage
      if (!content) {
        setError(`Error fetching syllabus: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      console.log('Debug: Finished fetchExistingSyllabus');
      debug('Finished fetchExistingSyllabus');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    const isRegenerating = content ? true : false;
    setAnalysis('');

    try {
      debug(`Starting syllabus generation for courseId: ${courseId}`);
      
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      let accessToken = null;
      
      // If session exists, use its token
      if (session?.access_token) {
        accessToken = session.access_token;
        debug('Using existing session token');
      } 
      // If no session, try to refresh it
      else {
        debug('No session found, attempting to refresh');
        // Try refreshing the session
        await supabase.auth.refreshSession();
        // Check again after refresh
        const { data: refreshData } = await supabase.auth.getSession();
        if (refreshData.session?.access_token) {
          accessToken = refreshData.session.access_token;
          debug('Got token from session refresh');
        }
        // If still no token, try to extract it directly from the cookie
        else {
          debug('No token after refresh, trying cookie extraction');
          try {
            const cookieStr = document.cookie;
            debug(`Cookie string: ${cookieStr.substring(0, 50)}...`);
            const tokenCookie = cookieStr.split(';')
              .map(c => c.trim())
              .find(c => c.startsWith('sb-wwgcghsoogmsmpeseszw-auth-token='));
            
            if (tokenCookie) {
              debug('Found auth cookie, attempting to parse');
              const tokenValue = decodeURIComponent(tokenCookie.split('=')[1]);
              // Token is stored as JSON array, we need to extract the token string
              const tokenParts = JSON.parse(tokenValue);
              if (tokenParts && tokenParts[0]) {
                accessToken = tokenParts[0];
                debug('Got token from cookie');
              }
            }
          } catch (e) {
            debug(`Error extracting token from cookie: ${e.message}`);
          }
        }
      }
      
      if (!accessToken) {
        throw new Error('No authentication token available. Please try logging in again.');
      }

      const url = isRegenerating 
        ? `/api/courses/${courseId}/syllabus?regenerate=true` 
        : `/api/courses/${courseId}/syllabus`;
      
      debug(`Making POST request to ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        debug(`Syllabus generation failed: ${response.status} ${response.statusText}`);
        
        // Try to get more detailed error message
        let errorText = '';
        try {
          errorText = await response.text();
          debug(`Error response body: ${errorText}`);
        } catch (e) {
          debug(`Could not read error response: ${e.message}`);
        }
        
        throw new Error(`Failed to generate syllabus: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }

      debug('Syllabus generation successful');
      const data = await response.json();
      debug(`Received data structure: ${Object.keys(data).join(', ')}`);
      
      if (!data.content) {
        debug('Response successful but no content field found in response');
      } else {
        debug(`Content received: ${data.content.length} characters`);
        // Cache the syllabus in localStorage for future use
        try {
          debug('Caching syllabus in localStorage');
          localStorage.setItem(`syllabus-${courseId}`, JSON.stringify(data));
        } catch (storageErr) {
          debug(`Error caching syllabus in localStorage: ${storageErr.message}`);
        }
      }
      
      setContent(data.content);
      setExpandedSections({});
      toast.success(isRegenerating ? 'Syllabus regenerated!' : 'Syllabus generated!');
      
      // Refresh the data to make sure it's consistent
      setTimeout(() => fetchExistingSyllabus(), 1000);
    } catch (err) {
      debug(`Error generating syllabus: ${err.message}`);
      toast.error('Failed to generate syllabus');
      setError(err.message);
    } finally {
      setIsGenerating(false);
      debug('Finished handleGenerate');
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');
    setAnalysis('');

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      let accessToken = null;
      
      // If session exists, use its token
      if (session?.access_token) {
        accessToken = session.access_token;
      } 
      // If no session, try to refresh it
      else {
        // Try refreshing the session
        await supabase.auth.refreshSession();
        // Check again after refresh
        const { data: refreshData } = await supabase.auth.getSession();
        if (refreshData.session?.access_token) {
          accessToken = refreshData.session.access_token;
        }
        // If still no token, try to extract it directly from the cookie
        else {
          try {
            const cookieStr = document.cookie;
            const tokenCookie = cookieStr.split(';')
              .map(c => c.trim())
              .find(c => c.startsWith('sb-wwgcghsoogmsmpeseszw-auth-token='));
            
            if (tokenCookie) {
              const tokenValue = decodeURIComponent(tokenCookie.split('=')[1]);
              // Token is stored as JSON array, we need to extract the token string
              const tokenParts = JSON.parse(tokenValue);
              if (tokenParts && tokenParts[0]) {
                accessToken = tokenParts[0];
              }
            }
          } catch (e) {
            console.error('Error extracting token from cookie:', e);
          }
        }
      }
      
      if (!accessToken) {
        throw new Error('No authentication token available. Please try logging in again.');
      }

      const response = await fetch(`/api/courses/${courseId}/syllabus?analyze=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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

  // New diagnostic function to check auth state
  const testAuthState = async () => {
    setIsTestingAuth(true);
    setError('');
    const diagnostics = { cookies: {}, localStorage: {}, session: null, apiTest: null };
    
    try {
      // Check cookies
      if (typeof document !== 'undefined') {
        diagnostics.cookies.all = document.cookie.split(';').map(c => c.trim());
        diagnostics.cookies.supabaseTokens = document.cookie.split(';')
          .map(c => c.trim())
          .filter(c => c.startsWith('sb-') || c.includes('auth'));
      }
      
      // Check localStorage
      if (typeof window !== 'undefined') {
        diagnostics.localStorage.hasAuthStorage = !!localStorage.getItem('courseforge-auth-storage');
        try {
          const storageData = localStorage.getItem('courseforge-auth-storage');
          if (storageData) {
            const parsed = JSON.parse(storageData);
            diagnostics.localStorage.parsedData = {
              hasSession: !!parsed.session,
              hasExpiresAt: !!parsed.expiresAt,
              sessionExpiresAt: parsed.expiresAt ? new Date(parsed.expiresAt * 1000).toISOString() : null,
              currentTime: new Date().toISOString(),
            };
          }
        } catch (e) {
          diagnostics.localStorage.parseError = e.message;
        }
      }
      
      // Check Supabase session
      const { data, error } = await supabase.auth.getSession();
      diagnostics.session = {
        hasSession: !!data?.session,
        hasError: !!error,
        errorMessage: error?.message,
        accessToken: data?.session?.access_token ? 'Present (truncated)' : null,
        tokenExpiry: data?.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
        user: data?.session?.user?.email || null,
      };
      
      // Make a test API call with explicit token
      const testToken = data?.session?.access_token;
      if (testToken) {
        const testResponse = await fetch(`/api/courses/${courseId}/syllabus`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${testToken}`,
          },
        });
        
        diagnostics.apiTest = {
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText,
        };
      }
      
      setAuthDiagnostics(diagnostics);
      toast.success('Auth diagnostics complete');
    } catch (err) {
      console.error('Auth test error:', err);
      setError(`Auth test error: ${err.message}`);
    } finally {
      setIsTestingAuth(false);
    }
  };

  const forceReload = () => {
    debug('Forcing full reload to fetch syllabus');
    // Clear localStorage for this course to force refetch
    try {
      localStorage.removeItem(`syllabus-${courseId}`);
      debug('Cleared localStorage cache');
    } catch (e) {
      debug(`Error clearing localStorage: ${e.message}`);
    }
    
    // Force a real page reload
    window.location.reload();
  };

  // Add this function after forceReload
  const checkDatabaseDirectly = async () => {
    debug('Checking database directly for syllabus');
    
    try {
      const response = await fetch(`/api/courses/${courseId}/syllabus?debug=true`);
      const debugData = await response.json();
      debug(`Direct database check response: ${JSON.stringify(debugData)}`);
      
      if (debugData.syllabusInfo) {
        const { id, courseId, hasContent, contentLength, createdAt, updatedAt } = debugData.syllabusInfo;
        debug(`Syllabus exists in database: ID ${id}, Content Length: ${contentLength}, Created: ${createdAt}`);
        toast.success(`Syllabus found in database: ${contentLength} characters`);
      } else if (debugData.message === 'Debug mode: No syllabus found') {
        debug('No syllabus found in database');
        toast.error('No syllabus found in database');
      } else {
        debug(`Unexpected debug response: ${JSON.stringify(debugData)}`);
      }
    } catch (e) {
      debug(`Error in direct database check: ${e.message}`);
      toast.error(`Database check failed: ${e.message}`);
    }
  };

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
      {/* Debug Panel */}
      <div className="bg-gray-800 text-white p-2 rounded-md mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'} ({logCount.current} logs)
          </button>
          <button 
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
            onClick={forceReload}
          >
            Force Reload
          </button>
          <button 
            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-sm"
            onClick={checkDatabaseDirectly}
          >
            Check Database
          </button>
        </div>
        <span className="text-xs">{`Client rendered at: ${new Date().toLocaleTimeString()}`}</span>
      </div>
      
      {showDebug && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-md mb-4 font-mono text-xs max-h-60 overflow-y-auto">
          {debugLogs.map((log, i) => (
            <div key={i} className="mb-1">{log}</div>
          ))}
        </div>
      )}
      
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
          {/* Auth Diagnostics */}
          <div className="mb-6">
            <button
              onClick={testAuthState}
              disabled={isTestingAuth}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isTestingAuth ? (
                <>
                  <FiRefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Testing Auth...
                </>
              ) : (
                <>
                  Test Authentication
                </>
              )}
            </button>
            
            {authDiagnostics && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Diagnostics</h3>
                
                <div className="mb-2">
                  <h4 className="font-medium">Session:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(authDiagnostics.session, null, 2)}
                  </pre>
                </div>
                
                <div className="mb-2">
                  <h4 className="font-medium">Cookies:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(authDiagnostics.cookies, null, 2)}
                  </pre>
                </div>
                
                <div className="mb-2">
                  <h4 className="font-medium">LocalStorage:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(authDiagnostics.localStorage, null, 2)}
                  </pre>
                </div>
                
                <div className="mb-2">
                  <h4 className="font-medium">API Test:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(authDiagnostics.apiTest, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
          
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