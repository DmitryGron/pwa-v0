"use client";

import Image from 'next/image';

const OfflinePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 mb-4">
            <Image 
              src="/icons/icon-192x192.png" 
              alt="App logo" 
              fill
              className="object-contain"
            />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">You&apos;re Offline</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          It seems you don&apos;t have an internet connection right now. Some features may be limited until you&apos;re back online.
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
