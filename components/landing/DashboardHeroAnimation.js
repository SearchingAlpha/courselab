import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Layout, LogOut, Menu, ChevronDown, Plus, Code, Clock, CheckCircle } from 'lucide-react';

const DashboardHeroAnimation = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [animationStep, setAnimationStep] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 400, y: 300 });
  const [clickEffect, setClickEffect] = useState(false);

  // Mock user data
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com"
  };

  // Mock courses
  const courses = [
    { id: 1, title: "Advanced Machine Learning", progress: 65, lastAccessed: "2 days ago" },
    { id: 2, title: "Data Structures & Algorithms", progress: 42, lastAccessed: "4 days ago" }
  ];

  // Simulate cursor movement and clicks
  useEffect(() => {
    const steps = [
      { pos: { x: 100, y: 180 }, action: 'hover', screen: 'dashboard' },
      { pos: { x: 400, y: 240 }, action: 'click', screen: 'courseDetail' },
      { pos: { x: 100, y: 230 }, action: 'click', screen: 'courses' },
      { pos: { x: 100, y: 285 }, action: 'click', screen: 'createCourse' },
      { pos: { x: 100, y: 180 }, action: 'click', screen: 'dashboard' }
    ];

    const animationInterval = setInterval(() => {
      const step = steps[animationStep % steps.length];
      setCursorPosition(step.pos);
      
      if (step.action === 'click') {
        setClickEffect(true);
        setTimeout(() => setClickEffect(false), 300);
        setActiveScreen(step.screen);
      }
      
      setAnimationStep(prev => prev + 1);
    }, 2500);

    return () => clearInterval(animationInterval);
  }, [animationStep]);

  // Dashboard screen content
  const DashboardScreen = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-gray-600 text-sm">
          Continue learning or create a new course to master complex topics.
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
          <div className="flex justify-between items-start">
            <h2 className="text-sm font-semibold text-gray-900">My Courses</h2>
            <div className="bg-blue-100 text-blue-600 text-xs font-semibold rounded-full px-2 py-0.5">
              {courses.length}
            </div>
          </div>
          <a className="flex items-center text-blue-600 mt-2 text-xs">
            <BookOpen size={12} className="mr-1" />
            <span className="font-medium">View all courses</span>
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-green-100">
          <div className="flex justify-between items-start">
            <h2 className="text-sm font-semibold text-gray-900">Create Course</h2>
            <div className="bg-green-100 text-green-600 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              <Plus size={10} />
            </div>
          </div>
          <a className="flex items-center text-green-600 mt-2 text-xs">
            <Layout size={12} className="mr-1" />
            <span className="font-medium">Create new course</span>
          </a>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent Courses</h2>
          <a className="text-xs text-blue-600">View all</a>
        </div>
        
        {courses.map((course) => (
          <div key={course.id} className="border rounded-lg p-3 mb-2 hover:shadow-md transition">
            <div className="flex justify-between">
              <h3 className="font-medium text-sm text-gray-900">{course.title}</h3>
              <span className="text-xs text-gray-500">{course.lastAccessed}</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-medium text-gray-700">{course.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Course detail screen
  const CourseDetailScreen = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <button className="flex items-center text-gray-600 text-xs">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to courses
        </button>
        
        <h1 className="text-xl font-bold text-gray-900 mt-2">Advanced Machine Learning</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Intermediate
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Balanced
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center mb-3">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <BookOpen size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Course Syllabus</h2>
            <p className="text-xs text-gray-600">6 modules • 120 hours</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-medium">Module 1: Foundations</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                15h
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Mathematical fundamentals and prerequisites</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Courses screen
  const CoursesScreen = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">My Courses</h1>
        <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center">
          <Plus size={12} className="mr-1" />
          New Course
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">{course.title}</h2>
              <span className="text-xs text-gray-500">{course.progress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-3">
              <button className="text-blue-600 text-xs font-medium">Continue</button>
              <span className="text-xs text-gray-500">{course.lastAccessed}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Create course screen
  const CreateCourseScreen = () => (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Create New Course</h1>
      <p className="text-sm text-gray-600">Define your course requirements to generate a personalized learning path</p>
      
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium ${
              stepNumber === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className="hidden sm:block h-1 w-10 bg-gray-200"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
              placeholder="e.g., Advanced Machine Learning"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Course Topic <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
              placeholder="Describe the specific topic you want to learn"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button className="px-3 py-1.5 border rounded-md text-sm border-gray-300 text-gray-700">
          Back
        </button>
        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">
          Next Step
        </button>
      </div>
    </div>
  );

  // Render the content based on active screen
  const renderContent = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'courseDetail':
        return <CourseDetailScreen />;
      case 'courses':
        return <CoursesScreen />;
      case 'createCourse':
        return <CreateCourseScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
      {/* Browser mockup */}
      <div className="bg-gray-900 px-4 py-2 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 flex-1 flex justify-center">
          <div className="bg-gray-700 rounded px-3 py-1 text-gray-300 text-xs max-w-sm truncate">
            courseforge.io/dashboard
          </div>
        </div>
      </div>
      
      {/* App interface */}
      <div className="bg-gray-100 h-96 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${
          isSidebarOpen ? 'w-48' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="text-sm font-bold text-blue-600">CourseForge</div>
          </div>
          
          <div className="px-3 py-2">
            <div className="mb-4 mt-2">
              <div className="flex items-center px-2 py-2 rounded-md">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div className="ml-2">
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="mt-2 space-y-1">
              <a className={`flex items-center px-3 py-2 text-xs rounded-md transition ${
                activeScreen === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}>
                <Home size={14} className="mr-2" />
                Dashboard
              </a>
              
              <a className={`flex items-center px-3 py-2 text-xs rounded-md transition ${
                activeScreen === 'courses' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}>
                <BookOpen size={14} className="mr-2" />
                My Courses
              </a>
              
              <a className={`flex items-center px-3 py-2 text-xs rounded-md transition ${
                activeScreen === 'createCourse' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}>
                <Layout size={14} className="mr-2" />
                Create Course
              </a>
              
              <a className="flex items-center px-3 py-2 text-xs rounded-md text-gray-700 hover:bg-red-50 hover:text-red-700 transition">
                <LogOut size={14} className="mr-2" />
                Sign Out
              </a>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <Menu size={16} />
            </button>
            
            <div className="flex items-center">
              <div className="relative inline-block text-left">
                <button className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  <span className="mr-1">{user.name}</span>
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </header>
          
          {/* Content area */}
          <main className="flex-1 overflow-auto bg-gray-50 p-4">
            {renderContent()}
          </main>
        </div>
      </div>
      
      {/* Animated cursor */}
      <div 
        className="absolute pointer-events-none w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-500"
        style={{ 
          left: cursorPosition.x, 
          top: cursorPosition.y 
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L18 18M9 14L4 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {clickEffect && (
          <div className="absolute top-0 left-0 w-8 h-8 bg-blue-500 rounded-full opacity-50 animate-ping"></div>
        )}
      </div>
      
      {/* Browser shine effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-white opacity-5 transform -translate-y-24 skew-y-6"></div>
      </div>
    </div>
  );
};

export default DashboardHeroAnimation;