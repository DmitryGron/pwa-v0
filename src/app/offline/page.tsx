"use client";

import Image from 'next/image';

const OfflinePage = () => {
  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 w-full max-w-md text-center bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="flex justify-center mb-6">
          <div className="relative mb-4 w-24 h-24">
            <Image 
              src="/icons/icon-192x192.png" 
              alt="App logo" 
              fill
              className="object-contain"
            />
          </div>
        </div>
        
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">You&apos;re Offline</h1>
        
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          It seems you don&apos;t have an internet connection right now. Some features may be limited until you&apos;re back online.
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
