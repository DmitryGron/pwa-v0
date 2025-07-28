'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { registerServiceWorker } from "../utils/registerSW";
import { detectDevice, DeviceInfo } from "../utils/deviceDetection";

type NetworkStatus = {
  online: boolean;
  type: string | null;
  effectiveType: string | null;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    type: string;
    effectiveType: string;
  };
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const Home = () => {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [installable, setInstallable] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: true,
    type: null,
    effectiveType: null,
  });

  // Check if the app is installable
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Register service worker manually in development
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Detect device information - only run on client
  useEffect(() => {
    // Immediately set device info once
    setDeviceInfo(detectDevice());
    
    // Update on resize (could change between tablet/desktop based on orientation)
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      if ("connection" in navigator) {
        const nav = navigator as NavigatorWithConnection;
        setNetworkStatus({
          online: navigator.onLine,
          type: nav.connection?.type || null,
          effectiveType: nav.connection?.effectiveType || null,
        });
      } else {
        setNetworkStatus({
          online: navigator.onLine,
          type: null,
          effectiveType: null,
        });
      }
    };

    updateNetworkStatus();
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    
    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    try {
      const promptEvent = installPrompt as BeforeInstallPromptEvent;
      promptEvent.prompt();
      const result = await promptEvent.userChoice;
      
      if (result.outcome === "accepted") {
        setInstallable(false);
      }
    } catch (error) {
      console.error("Error installing app:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <header className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/icons/icon-192x192.png"
              alt="PWA Logo"
              width={80}
              height={80}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">Next.js PWA Boilerplate</h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            A Progressive Web App built with Next.js
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">PWA Features</h2>
          
          <div className="space-y-4">
            {/* Device Information */}
            <div className="border-l-4 border-yellow-500 pl-4 mb-4">
              <h3 className="font-medium text-gray-800 dark:text-white">Device Information</h3>
              {deviceInfo && (
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  <p>
                    <strong>Type:</strong> {deviceInfo.isMobile ? "📱 Mobile" : deviceInfo.isTablet ? "📱 Tablet" : "💻 Desktop"}
                  </p>
                  <p>
                    <strong>OS:</strong> {deviceInfo.os.charAt(0).toUpperCase() + deviceInfo.os.slice(1)}
                  </p>
                  <p>
                    <strong>Browser:</strong> {deviceInfo.browser.charAt(0).toUpperCase() + deviceInfo.browser.slice(1)}
                  </p>
                  <p>
                    <strong>PWA Mode:</strong> {deviceInfo.isStandalone ? "✅ Installed as PWA" : "📱 Browser"}
                  </p>
                </div>
              )}
            </div>
            
            {/* Network Status */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-800 dark:text-white">Network Status</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {networkStatus.online ? "✅ Online" : "❌ Offline"}
                {networkStatus.type && ` - Type: ${networkStatus.type}`}
                {networkStatus.effectiveType && ` (${networkStatus.effectiveType})`}
              </p>
            </div>
            
            {/* Installable Status */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-800 dark:text-white">Installable</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {installable ? "✅ This app can be installed on your device" : "This app may already be installed"}
              </p>
              {installable && (
                <button
                  onClick={handleInstallClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded transition-colors"
                >
                  Install App
                </button>
              )}
            </div>
            
            {/* Offline Support */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-800 dark:text-white">Offline Support</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This app works offline thanks to service worker caching
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="max-w-md mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Try turning off your network to test offline functionality</p>
      </footer>
    </div>
  );
};

export default Home;
