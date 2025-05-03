'use client';

import { useEffect, useState } from 'react';
import { debugAuthStore } from '@/lib/auth';

/**
 * This component can be placed anywhere in the app to debug auth issues
 * Only visible in development mode
 */
export default function AuthDebug() {
  const [authInfo, setAuthInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Function to check and update auth state
    const checkAuth = async () => {
      try {
        // Log to console
        debugAuthStore();
        
        // Get storage data for display
        const storageData = localStorage.getItem('courseforge-auth-storage');
        const cookies = document.cookie.split(';')
          .map(c => c.trim())
          .filter(c => c.includes('sb-'));
          
        // Parse session info when available
        let sessionInfo = null;
        if (storageData) {
          try {
            const parsed = JSON.parse(storageData);
            if (parsed.session) {
              sessionInfo = {
                userId: parsed.session.user?.id,
                expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt * 1000).toISOString() : null,
                currentTime: new Date().toISOString(),
                timeRemaining: parsed.expiresAt 
                  ? Math.floor((parsed.expiresAt * 1000 - Date.now()) / 1000 / 60) + ' minutes' 
                  : 'N/A',
              };
            }
          } catch (e) {
            console.log("Failed to parse storage data", e);
          }
        }
        
        setAuthInfo({
          hasStorage: !!storageData,
          cookies: cookies,
          sessionInfo: sessionInfo
        });
      } catch (e) {
        console.error("Error in auth debug:", e);
      }
    };
    
    // Check immediately and every 10 seconds
    checkAuth();
    const interval = setInterval(checkAuth, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Don't render anything in production or if not in dev mode
  if (process.env.NODE_ENV !== 'development' || !authInfo) {
    return null;
  }
  
  return (
    <div className="fixed bottom-2 right-2 bg-gray-800 text-white p-2 rounded-md text-xs z-50 opacity-80 hover:opacity-100 transition-opacity">
      <div className="flex justify-between items-center">
        <span>
          Auth: {authInfo.sessionInfo ? '✅' : '❌'} 
          {authInfo.sessionInfo && ` (${authInfo.sessionInfo.timeRemaining})`}
        </span>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="ml-2 px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-2 border-t border-gray-700 pt-2">
          <p>Storage: {authInfo.hasStorage ? '✅' : '❌'}</p>
          {authInfo.cookies.length > 0 ? (
            <p>Cookies: {authInfo.cookies.length} found</p>
          ) : (
            <p>Cookies: None</p>
          )}
          {authInfo.sessionInfo && (
            <div className="mt-1">
              <p>User ID: {authInfo.sessionInfo.userId}</p>
              <p>Expires: {authInfo.sessionInfo.timeRemaining}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 