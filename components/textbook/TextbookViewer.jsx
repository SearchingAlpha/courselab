'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Moon, 
  Sun, 
  Bookmark, 
  BookmarkPlus,
  FileText,
  List
} from 'lucide-react';

export default function TextbookViewer({ 
  courseId,
  moduleId,
  chapterId,
  title,
  content,
  nextChapter,
  prevChapter,
  allChapters = []
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tableOfContentsOpen, setTableOfContentsOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const contentRef = useRef(null);
  const router = useRouter();

  // Extract headings for table of contents
  const headings = content
    ? content.split('\n')
        .filter(line => line.startsWith('##'))
        .map(line => {
          const text = line.replace(/^##\s+/, '');
          const id = text.toLowerCase().replace(/\s+/g, '-');
          return { text, id };
        })
    : [];

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`bookmarks-${courseId}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Load font size preference
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
  }, [courseId]);

  // Add bookmark
  const addBookmark = () => {
    const newBookmark = {
      moduleId,
      chapterId,
      title,
      position: contentRef.current?.scrollTop || 0,
      date: new Date().toISOString()
    };
    
    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks-${courseId}`, JSON.stringify(updatedBookmarks));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Change font size
  const changeFontSize = (delta) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize.toString());
  };

  // Download chapter as markdown
  const downloadChapter = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Navigate to next/previous chapter
  const navigateToChapter = (chapter) => {
    if (chapter) {
      router.push(`/dashboard/courses/${courseId}/textbook/module-${chapter.moduleId}/${chapter.id}`);
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      {/* Left sidebar - Chapter navigation */}
      <div className={`
        fixed top-0 bottom-0 left-0 z-30
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-0'} 
        ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}
        border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        overflow-hidden
      `}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold flex items-center">
              <BookOpen size={18} className="mr-2" />
              Chapters
            </h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <ChevronLeft size={18} />
            </button>
          </div>
          
          <div className={`overflow-y-auto flex-grow ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
            {allChapters.map((chapter, idx) => (
              <div key={idx} className="mb-2">
                <Link
                  href={`/dashboard/courses/${courseId}/textbook/module-${chapter.moduleId}/${chapter.id}`}
                  className={`
                    block px-3 py-2 rounded-md text-sm 
                    ${moduleId === chapter.moduleId && chapterId === chapter.id 
                      ? `font-medium ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`
                      : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`
                    }
                  `}
                >
                  <div className="flex items-start">
                    <FileText size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>{chapter.title}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Bookmarks section */}
          <div className="mt-6">
            <h3 className="font-medium text-sm mb-2 flex items-center">
              <Bookmark size={16} className="mr-2" />
              Bookmarks
            </h3>
            <div className={`max-h-40 overflow-y-auto ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark, idx) => (
                  <div key={idx} className={`text-xs p-2 mb-1 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="font-medium truncate">{bookmark.title}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(bookmark.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs opacity-70">No bookmarks yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        {/* Top navbar */}
        <div className={`
          flex items-center justify-between p-4 sticky top-0 z-20
          ${darkMode ? 'bg-gray-800' : 'bg-white'} 
          border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <List size={20} />
            </button>
          )}
          
          <div className="flex-1 px-4">
            <h1 className="font-bold text-lg truncate">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setTableOfContentsOpen(!tableOfContentsOpen)}
              className={`p-2 rounded-md text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} flex items-center`}
            >
              <FileText size={16} className="mr-1" />
              <span className="hidden sm:inline">Contents</span>
            </button>
            
            <button 
              onClick={addBookmark}
              className={`p-2 rounded-md text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} flex items-center`}
            >
              <BookmarkPlus size={16} className="mr-1" />
              <span className="hidden sm:inline">Bookmark</span>
            </button>
            
            <button 
              onClick={downloadChapter}
              className={`p-2 rounded-md text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} flex items-center`}
            >
              <Download size={16} className="mr-1" />
              <span className="hidden sm:inline">Download</span>
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
        
        {/* Content area with table of contents */}
        <div className="flex">
          {/* Main content */}
          <div 
            ref={contentRef}
            className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-64px)] ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="max-w-4xl mx-auto">
              <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}>
                {content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            language={match[1]}
                            style={darkMode ? vscDarkPlus : vs}
                            PreTag="div"
                            className="rounded-md"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <div className="text-center py-10 opacity-70">No content available</div>
                )}
              </div>
              
              {/* Navigation controls */}
              <div className="mt-12 mb-6 flex justify-between">
                <button
                  onClick={() => navigateToChapter(prevChapter)}
                  disabled={!prevChapter}
                  className={`
                    flex items-center px-4 py-2 rounded-md
                    ${!prevChapter ? 'opacity-50 cursor-not-allowed' : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                  `}
                >
                  <ChevronLeft size={20} className="mr-2" />
                  Previous Chapter
                </button>
                
                <button
                  onClick={() => navigateToChapter(nextChapter)}
                  disabled={!nextChapter}
                  className={`
                    flex items-center px-4 py-2 rounded-md
                    ${!nextChapter ? 'opacity-50 cursor-not-allowed' : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                  `}
                >
                  Next Chapter
                  <ChevronRight size={20} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Table of contents sidebar */}
          <div className={`
            fixed top-[64px] right-0 z-20
            transition-all duration-300 ease-in-out
            ${tableOfContentsOpen ? 'w-64' : 'w-0'} 
            ${darkMode ? 'bg-gray-800' : 'bg-white'}
            border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            overflow-hidden h-[calc(100vh-64px)]
          `}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm">Table of Contents</h3>
                <button 
                  onClick={() => setTableOfContentsOpen(false)}
                  className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              
              <div className={`overflow-y-auto ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                {headings.map((heading, idx) => (
                  <a
                    key={idx}
                    href={`#${heading.id}`}
                    className={`
                      block text-sm py-2 px-3 mb-1 rounded 
                      ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                    `}
                  >
                    {heading.text}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Font size controls */}
        <div className={`
          fixed bottom-6 right-6 z-30
          flex items-center space-x-2 p-2 rounded-full
          ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
          shadow-lg
        `}>
          <button 
            onClick={() => changeFontSize(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-opacity-20 hover:bg-gray-500"
          >
            A<span className="text-xs">-</span>
          </button>
          <span className="text-sm w-8 text-center">{fontSize}</span>
          <button 
            onClick={() => changeFontSize(1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-opacity-20 hover:bg-gray-500"
          >
            A<span className="text-xs">+</span>
          </button>
        </div>
      </div>
    </div>
  );
} 