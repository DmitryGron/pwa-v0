'use client';

import { useEffect, useState } from 'react';
import { checkPushNotificationSupport } from '../utils/pushNotifications';
import { detectDevice } from '../utils/deviceDetection';

type NotificationPermissionPromptProps = {
  className?: string;
};

type BrowserSupportStatus = {
  isSupported: boolean;
  message?: string;
};

const NotificationPermissionPrompt = ({ className = '' }: NotificationPermissionPromptProps) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [browserSupport, setBrowserSupport] = useState<BrowserSupportStatus>({ isSupported: false });
  const [browserInfo, setBrowserInfo] = useState<{ name: string; isMobile: boolean }>({ name: 'unknown', isMobile: false });

  useEffect(() => {
    const checkBrowserSupport = () => {
      if (typeof window !== 'undefined') {
        const device = detectDevice();
        setBrowserInfo({
          name: device.browser,
          isMobile: device.isMobile
        });

        if (!('Notification' in window)) {
          setBrowserSupport({
            isSupported: false,
            message: 'Notifications are not supported in this browser'
          });
          return false;
        }

        const supportStatus = checkPushNotificationSupport();
        setBrowserSupport({
          isSupported: supportStatus.supported,
          message: supportStatus.message
        });

        return supportStatus.supported;
      }
      return false;
    };

    const isSupported = checkBrowserSupport();

    if (isSupported) {
      const permission = Notification.permission;
      setPermissionState(permission);

      if (permission === 'granted') {
        console.log('[Notifications] Permission is granted, saving state');
        localStorage.setItem('notificationPermissionState', 'granted');
      }

      const savedPermission = localStorage.getItem('notificationPermissionState');
      if (savedPermission === 'granted' && permission !== 'granted') {
        console.log('[Notifications] Using saved permission state from localStorage');
        setPermissionState('granted');
      }
    }

    const notificationDismissed = localStorage.getItem('notificationPromptDismissed');
    if (notificationDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!browserSupport.isSupported) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    try {
      let permission: NotificationPermission;

      try {
        permission = await Notification.requestPermission();
      } catch (promiseError) {
        if (typeof Notification.requestPermission === 'function') {
          return new Promise<void>((resolve) => {
            Notification.requestPermission((result) => {
              setPermissionState(result);
              if (result === 'granted') {
                showWelcomeNotification();
              }
              resolve();
            });
          });
        }
        throw promiseError;
      }

      setPermissionState(permission);

      if (permission === 'granted') {
        showWelcomeNotification();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const showWelcomeNotification = () => {
    try {
      new Notification('Notifications Enabled', {
        body: 'You will now receive notifications from our app.',
        icon: '/icon-192x192.png'
      });
    } catch (notificationError) {
      console.error('Error showing welcome notification:', notificationError);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  console.log("Browser info:", browserInfo);
  console.log("Browser support:", browserSupport);
  console.log("Permission state:", permissionState);
  console.log("Dismissed:", dismissed);

  if (!browserSupport.isSupported) {
    return null;
  }

  if (
    permissionState === 'granted' ||
    permissionState === 'denied' ||
    dismissed
  ) {
    return null;
  }

  return (
    <div className={`fixed right-0 bottom-0 left-0 z-40 ${className}`}>
      <div className="flex relative justify-between items-center p-4 mx-4 mb-4 text-white rounded-lg shadow-lg bg-red">
        <button
          onClick={handleDismiss}
          className="absolute top-1 right-1 text-xl font-bold text-white bg-transparent border-none"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex-grow pr-2">
          <h3 className="font-bold">Enable Notifications</h3>
          <p className="text-sm">Stay updated with important information from our app</p>

          {browserSupport.message && (
            <p className="mt-1 text-xs italic">
              {browserSupport.message}
            </p>
          )}
        </div>
        <div>
          <button
            onClick={handleRequestPermission}
            className="px-2 py-1 font-bold bg-white rounded text-red"
            disabled={!browserSupport.isSupported}
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionPrompt;
