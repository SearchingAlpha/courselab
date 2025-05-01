'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, ChevronDown, Home, BookOpen, Code, BookType, Layout, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      try {
        console.log('DashboardLayout: Getting user...');
        const { data: { user } } = await supabase.auth.getUser();
        console.log('DashboardLayout: User data:', user);
        setUser(user);
      } catch (error) {
        console.error('DashboardLayout: Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('DashboardLayout: Auth state changed:', _event, session?.user);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle authentication redirect - only redirect if we're sure the user is not authenticated
  useEffect(() => {
    console.log('DashboardLayout: Auth check - loading:', loading, 'user:', user);
    if (!loading && !user) {
      console.log('DashboardLayout: No user found, redirecting to signin...');
      // Add a small delay to ensure session cookies are properly set
      const timer = setTimeout(() => {
        // Check one more time before redirecting
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) {
            router.push('/auth/signin');
          }
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, user, router]);
  
  // While loading session, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If not authenticated, return null (will be handled by useEffect)
  if (!user) {
    return null;
  }
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    try {
      // Clear user state first
      setUser(null);
      setLoading(true);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Clear any remaining cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      // Force a hard reload to ensure all state is cleared
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
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