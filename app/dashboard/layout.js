'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, ChevronDown, Home, BookOpen, Code, BookType, Layout, LogOut } from 'lucide-react';
import { getUser, signOut, debugAuthStore } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Only run this once on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Dashboard: Checking user authentication...");
        debugAuthStore(); // Debug auth store
        
        // Get the user data
        const currentUser = await getUser();
        console.log("Dashboard: User check result:", currentUser);
        
        if (!currentUser) {
          console.log("Dashboard: No user found, redirecting to signin...");
          // Just show loading state. Don't trigger a redirect during render
          setUser(null);
        } else {
          console.log("Dashboard: User authenticated:", currentUser.email);
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Dashboard: Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);
  
  // Separate effect to handle redirects
  useEffect(() => {
    if (authChecked && !user && !loading) {
      console.log("Dashboard: Auth checked, no user, redirecting to signin...");
      window.location.href = '/auth/signin';
    }
  }, [authChecked, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't redirect here - we'll handle that in the effect above
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    try {
      console.log("Dashboard: Signing out user...");
      await signOut(true); // Will handle redirect internally
    } catch (error) {
      console.error('Dashboard: Error signing out:', error);
      window.location.href = '/auth/signin';
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition duration-300 transform md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="text-xl font-bold text-blue-600">CourseForge</div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="px-4 py-2">
          <div className="mb-6 mt-4">
            <div className="flex items-center px-2 py-3 rounded-md">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {user?.user_metadata?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email || ''}
                </div>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Home size={18} className="mr-3" />
              Dashboard
            </Link>
            
            <Link
              href="/dashboard/courses"
              className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <BookOpen size={18} className="mr-3" />
              My Courses
            </Link>
            
            <Link
              href="/dashboard/create-course"
              className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Layout size={18} className="mr-3" />
              Create Course
            </Link>
            
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-4 py-3 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition"
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-4 md:px-6">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none md:hidden"
            >
              <Menu size={20} />
            </button>
            
            <div className="text-lg font-semibold md:hidden">CourseForge</div>
            
            <div className="flex items-center">
              <div className="relative inline-block text-left">
                <button
                  className="inline-flex items-center justify-center w-full rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  <span className="mr-2">
                    {user?.user_metadata?.name || 'User'}
                  </span>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}