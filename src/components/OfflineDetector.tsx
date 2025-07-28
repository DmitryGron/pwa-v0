'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type OfflineDetectorProps = {
  fallbackOfflinePath?: string;
  showIndicator?: boolean;
  children?: React.ReactNode;
};

const OfflineDetector = ({
  fallbackOfflinePath = '/offline',
  showIndicator = true,
  children
}: OfflineDetectorProps) => {
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Check initial status
    setIsOffline(!navigator.onLine);
    
    // Set up event listeners for online/offline status
    const handleOffline = () => {
      setIsOffline(true);
      if (fallbackOfflinePath && window.location.pathname !== fallbackOfflinePath) {
        router.push(fallbackOfflinePath);
      }
    };
    
    const handleOnline = () => {
      setIsOffline(false);
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [fallbackOfflinePath, router]);
  
  // If not showing the indicator or we're online, just render children
  if (!showIndicator || !isOffline) {
    return <>{children}</>;
  }
  
  // Render offline indicator along with children
  return (
    <>
      <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm fixed top-0 left-0 right-0 z-50">
        You are currently offline. Some features may not be available.
      </div>
      <div className="pt-10">{children}</div>
    </>
  );
};

export default OfflineDetector;
