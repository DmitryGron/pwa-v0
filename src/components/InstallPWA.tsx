'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// Type definition for iOS Safari navigator with standalone property
type SafariNavigator = Navigator & {
  standalone?: boolean;
}

type InstallPWAProps = {
  className?: string;
};

const InstallPWA = ({ className = '' }: InstallPWAProps) => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    // Check if the device is iOS
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    setIsIOS(isAppleDevice);
    
    const handler = (event: Event) => {
      // Prevent the default browser install prompt
      event.preventDefault();
      // Store the event for later use
      setPromptInstall(event as BeforeInstallPromptEvent);
      setSupportsPWA(true);
    };
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  // Check if the app is already installed using multiple detection methods
  useEffect(() => {
    const checkIfInstalled = () => {
      // Method 1: Check display-mode media query (works on Chrome, Edge, Firefox)
      const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Method 2: Check navigator.standalone (works on iOS Safari)
      const isIosStandalone = 'standalone' in navigator && (navigator as SafariNavigator).standalone === true;
      
      // Method 3: Check if window in standalone mode (works on most PWAs)
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (navigator as SafariNavigator).standalone === true;
      
      // Method 4: Check if launched via manifest URL (may work on some browsers)
      const isManifestLaunch = window.location.href.includes('?homescreen=1');
      
      // Method 5: Check for saved installation flag
      const hasInstalledFlag = localStorage.getItem('pwaInstalled') === 'true';

      // If any detection method returns true, the app is installed
      if (isDisplayModeStandalone || isIosStandalone || isInStandaloneMode || isManifestLaunch || hasInstalledFlag) {
        console.log('[PWA] Running in installed mode');
        setSupportsPWA(false);
        return true;
      }
      return false;
    };
    
    // Run the check immediately
    checkIfInstalled();
    
    // Also listen for visibility changes, as the app might be installed while in background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkIfInstalled();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!promptInstall) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }
    
    promptInstall.prompt().then(() => {
      promptInstall.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          // Save installation flag to localStorage
          localStorage.setItem('pwaInstalled', 'true');
          // Hide the install prompt immediately
          setSupportsPWA(false);
        } else {
          console.log('User dismissed the install prompt');
        }
        setPromptInstall(null);
      });
    });
  };
  
  const handleDismiss = () => {
    setDismissed(true);
    // No longer persist dismissal to localStorage
  };
  
  // Hide prompt if already installed or dismissed
  if ((!supportsPWA && !isIOS) || dismissed) return null;
  
  return (
    <div className={`fixed right-0 bottom-0 left-0 z-50 ${className}`}>
      {showIOSGuide ? (
        <div className="p-4 mx-4 mb-4 text-white rounded-lg shadow-lg bg-red">
          <button 
            onClick={() => setShowIOSGuide(false)}
            className="float-right mr-1 text-lg font-bold text-white bg-transparent border-none"
            aria-label="Close guide"
          >
            &times;
          </button>
          <button 
            onClick={handleDismiss}
            className="float-right mt-1 mr-2 text-sm text-white underline bg-transparent border-none"
            aria-label="Don't show again"
          >
            Don&apos;t show again
          </button>
          <h3 className="mb-2 text-lg font-bold">Install this app on your iPhone</h3>
          <ol className="pl-5 mb-2 list-decimal">
            <li>Tap the share icon <span className="inline-block w-5 h-5 leading-5 text-center bg-white rounded text-red">↑</span> at the bottom of the screen</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong> in the top right corner</li>
          </ol>
          <p className="text-sm">This app will then appear on your home screen like any other app</p>
        </div>
      ) : (
        <div className="flex relative justify-between items-center p-4 mx-4 mb-4 text-white rounded-lg shadow-lg bg-red">
          <button 
            onClick={handleDismiss}
            className="absolute top-1 right-1 text-xl font-bold text-white bg-transparent border-none"
            aria-label="Close"
          >
            &times;
          </button>
          <div>
            <h3 className="font-bold">Install App</h3>
            <p className="text-sm">Install this app on your device for easy access</p>
          </div>
          <button 
            onClick={handleInstallClick}
            className="px-2 py-1 font-bold bg-white rounded text-red"
          >
            Install
          </button>
        </div>
      )}
    </div>
  );
};

export default InstallPWA;
