'use client';

import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { detectDevice, DeviceInfo } from "../utils/deviceDetection";
import InstallPWA from "../components/InstallPWA";

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

// BeforeInstallPromptEvent type moved to InstallPWA component

const Home = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: true,
    type: null,
    effectiveType: null,
  });

  // Installation prompt is now handled by InstallPWA component
  // Service worker registration is now handled by NotificationContext

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

  // Install click handler now in InstallPWA component

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="flex justify-center mb-8">
        <div className="p-4 w-full max-w-md bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <div className="flex justify-center items-center mb-4">
            <Image
              src="/icons/icon-192x192.png"
              alt="PWA Logo"
              width={80}
              height={80}
              className="rounded-xl"
            />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-center text-gray-800 dark:text-white">Next.js PWA Boilerplate</h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            A Progressive Web App built with Next.js
          </p>
        </div>
      </header>

      <main className="overflow-hidden mx-auto mb-6 max-w-md bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">PWA Features</h2>
          
          <div className="space-y-4">     
            <div className="pl-4 mb-4 border-l-4 border-yellow-500">
              <h3 className="font-medium text-gray-800 dark:text-white">Device Information</h3>
              {deviceInfo && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
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
            
            <div className="pl-4 border-l-4 border-blue-500">
              <h3 className="font-medium text-gray-800 dark:text-white">Network Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {networkStatus.online ? "✅ Online" : "❌ Offline"}
                {networkStatus.type && ` - Type: ${networkStatus.type}`}
                {networkStatus.effectiveType && ` (${networkStatus.effectiveType})`}
              </p>
            </div>
            
            {/* Installable Status - Now handled by InstallPWA component */}
            <div className="pl-4 border-l-4 border-green-500">
              <h3 className="font-medium text-gray-800 dark:text-white">Installable</h3>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                This app can be installed on your device. Look for the install banner at the bottom of the screen.
              </p>
            </div>
            
            {/* Offline Support */}
            <div className="pl-4 border-l-4 border-purple-500">
              <h3 className="font-medium text-gray-800 dark:text-white">Offline Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This app works offline thanks to service worker caching
              </p>
            </div>
            
            {/* Notifications */}
            <div className="pl-4 border-l-4 border-red">
              <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This app supports both in-app and push notifications
              </p>
              <Link 
                href="/notifications-demo" 
                className="mt-2 inline-block px-4 py-2 bg-red text-white text-sm rounded hover:bg-red/90"
              >
                Try Notifications
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mx-auto max-w-md text-sm text-center text-gray-500 dark:text-gray-400">
        <p>Try turning off your network to test offline functionality</p>
        <p className="mt-2">Visit the <Link href="/notifications-demo" className="text-red underline">notifications demo</Link> to try out the notification system</p>
      </footer>

      {/* Add to Home Screen prompt */}
      {/* <InstallPWA className="mx-auto max-w-md" /> */}
    </div>
  );
};

export default Home;
