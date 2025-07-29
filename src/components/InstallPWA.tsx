import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

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
  
  // Check if the app is already installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // App is already installed and running standalone
      setSupportsPWA(false);
    }
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
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
      {showIOSGuide ? (
        <div className="bg-red text-white p-4 mx-4 mb-4 rounded-lg shadow-lg">
          <button 
            onClick={() => setShowIOSGuide(false)}
            className="float-right bg-transparent border-none text-white text-lg font-bold mr-1"
            aria-label="Close guide"
          >
            &times;
          </button>
          <button 
            onClick={handleDismiss}
            className="float-right bg-transparent border-none text-white text-sm underline mr-2 mt-1"
            aria-label="Don't show again"
          >
            Don&apos;t show again
          </button>
          <h3 className="font-bold text-lg mb-2">Install this app on your iPhone</h3>
          <ol className="list-decimal pl-5 mb-2">
            <li>Tap the share icon <span className="inline-block w-5 h-5 bg-white rounded text-red text-center leading-5">↑</span> at the bottom of the screen</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong> in the top right corner</li>
          </ol>
          <p className="text-sm">This app will then appear on your home screen like any other app</p>
        </div>
      ) : (
        <div className="bg-red text-white p-4 mx-4 mb-4 rounded-lg shadow-lg flex items-center justify-between relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-1 right-1 bg-transparent border-none text-white text-xl font-bold"
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
            className="bg-white text-red font-bold py-1 px-2 rounded"
          >
            Install
          </button>
        </div>
      )}
    </div>
  );
};

export default InstallPWA;
