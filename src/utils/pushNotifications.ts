// Utility for handling push notification subscription

import { detectDevice } from './deviceDetection';

/**
 * Get browser version from user agent
 * @returns Browser version number
 */
const getBrowserVersion = (userAgent: string = navigator.userAgent): number => {
  // iOS version detection
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  if (isIOS) {
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/i);
    return match ? parseInt(match[1], 10) : 0;
  }
  
  // Browser-specific version detection
  const chromeMatch = userAgent.match(/(?:Chrome|CriOS)\/(\d+)/i);
  const firefoxMatch = userAgent.match(/(?:Firefox|FxiOS)\/(\d+)/i);
  const safariMatch = userAgent.match(/Version\/(\d+)/i);
  const edgeMatch = userAgent.match(/(?:Edge|Edg)\/(\d+)/i);
  const samsungMatch = userAgent.match(/SamsungBrowser\/(\d+)/i);
  
  if (chromeMatch) return parseInt(chromeMatch[1], 10);
  if (firefoxMatch) return parseInt(firefoxMatch[1], 10);
  if (safariMatch) return parseInt(safariMatch[1], 10);
  if (edgeMatch) return parseInt(edgeMatch[1], 10);
  if (samsungMatch) return parseInt(samsungMatch[1], 10);
  
  return 0;
};

/**
 * Check if the device supports push notifications
 * @returns Object with support status and any relevant messages
 */
export const checkPushNotificationSupport = (): { supported: boolean; message?: string } => {
  // Basic feature detection
  const serviceWorkerSupported = 'serviceWorker' in navigator;
  const pushManagerSupported = 'PushManager' in window;
  const notificationSupported = 'Notification' in window;
  
  // If basic features aren't supported, no need to check browser specifics
  if (!serviceWorkerSupported || !pushManagerSupported || !notificationSupported) {
    return { 
      supported: false, 
      message: 'Push notifications are not supported in this browser'
    };
  }
  
  // Get device info using the existing utility
  const device = detectDevice();
  const browserVersion = getBrowserVersion();
  
  // Browser-specific checks
  
  // iOS Safari
  if (device.os === 'ios') {
    if (browserVersion < 16) {
      return { 
        supported: false,
        message: 'Push notifications require iOS 16.4 or later and adding to home screen'
      };
    } else {
      return {
        supported: true,
        message: 'For iOS: Add to home screen for full push notification support'
      };
    }
  }
  
  // Internet Explorer (not in the enum, but check for completeness)
  if (device.browser === 'other' && /trident|msie/i.test(navigator.userAgent)) {
    return {
      supported: false,
      message: 'Push notifications are not supported in Internet Explorer'
    };
  }
  
  // Samsung Internet (caught as 'other' in DeviceInfo)
  if (device.browser === 'other' && /samsungbrowser/i.test(navigator.userAgent)) {
    if (browserVersion < 7) {
      return {
        supported: false,
        message: 'Push notifications may not be fully supported in this browser version'
      };
    }
  }
  
  // Chrome on Android before version 50 had issues
  if (device.browser === 'chrome' && device.os === 'android' && browserVersion < 50) {
    return {
      supported: true,
      message: 'Push notifications may not work reliably on this browser version'
    };
  }
  
  // Firefox on Android before version 48 had issues
  if (device.browser === 'firefox' && device.os === 'android' && browserVersion < 48) {
    return {
      supported: true,
      message: 'Push notifications may not work reliably on this browser version'
    };
  }
  
  // All checks passed, should be supported
  return { supported: true };
};

/**
 * Request permission and subscribe to push notifications
 * @param serverPublicKey - VAPID public key from your notification server
 * @returns Push subscription object or null if failed
 */
export const subscribeToPushNotifications = async (serverPublicKey: string): Promise<PushSubscription | null | { error: string }> => {
  try {
    // Check for notifications API first
    if (!('Notification' in window)) {
      return { error: 'Notifications API not supported in this browser' };
    }
    
    // Check platform support using our enhanced detection
    const supportCheck = checkPushNotificationSupport();
    const device = detectDevice();
    
    if (!supportCheck.supported) {
      console.error(`Push notification not supported: ${supportCheck.message}`);
      return { error: supportCheck.message || 'Push notifications are not supported on this device' };
    }
    
    // Request notification permission if not granted
    let permission = Notification.permission;
    
    // If permission is not determined yet, request it
    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission();
      } catch (permissionError) {
        // Some older browsers use callbacks instead of promises
        if (typeof Notification.requestPermission === 'function' && 
            !(permissionError instanceof TypeError)) {
          console.error('Permission request error:', permissionError);
          return { error: 'Failed to request notification permission' };
        }
      }
    }
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return { error: 'Notification permission denied' };
    }
    
    // Handle browser-specific warning
    if (supportCheck.message) {
      console.warn(supportCheck.message);
      // Continue with subscription but the message can be shown to the user
    }
    
    // Make sure service worker is registered
    if (!('serviceWorker' in navigator)) {
      return { error: 'Service Worker API not supported in this browser' };
    }
    
    try {
      // Register or get service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Make sure push manager is available
      if (!registration.pushManager) {
        return { error: 'Push Manager API not available' };
      }
      
      // Get existing subscription or create a new one
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        try {
          // Convert the VAPID public key to Uint8Array
          const applicationServerKey = urlBase64ToUint8Array(serverPublicKey);
          
          // Create new subscription with error handling
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });
        } catch (subscriptionError) {
          // Specific error for permission denied during subscription
          if (subscriptionError instanceof DOMException && 
              subscriptionError.name === 'NotAllowedError') {
            return { error: 'Push permission denied by the user or system' };
          }
          
          // Browser-specific error handling
          if (device.os === 'ios') {
            return { error: 'iOS requires adding the app to home screen for push notifications' };
          }
          
          throw subscriptionError; // Re-throw for general catch
        }
      }
      
      return subscription;
    } catch (serviceWorkerError) {
      console.error('Service Worker error:', serviceWorkerError);
      return { error: 'Error with Service Worker registration' };
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return { error: `Subscription failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

/**
 * Unsubscribe from push notifications
 * @returns boolean indicating success
 */
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    console.log('Starting unsubscribe process...');
    
    // Check if service worker is available
    if (!('serviceWorker' in navigator)) {
      console.error('Service worker not available');
      return false;
    }
    
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker registration ready');
    
    // Get current subscription
    const subscription = await registration.pushManager.getSubscription();
    console.log('Current subscription status:', subscription ? 'Found' : 'Not found');
    
    if (subscription) {
      try {
        const result = await subscription.unsubscribe();
        console.log('Unsubscribe result:', result);
        return result;
      } catch (unsubError) {
        console.error('Specific unsubscribe error:', unsubError);
        return false;
      }
    } else {
      console.log('No subscription found to unsubscribe from');
      // If no subscription exists, we consider this a successful unsubscription
      return true;
    }
  } catch (error) {
    console.error('Error in unsubscribe process:', error);
    return false;
  }
};

/**
 * Check if the user is currently subscribed to push notifications
 * @returns boolean indicating subscription status
 */
export const isPushNotificationSubscribed = async (): Promise<boolean> => {
  try {
    // First check if basic APIs are supported
    if (!('serviceWorker' in navigator) || 
        !('PushManager' in window) || 
        !('Notification' in window)) {
      return false;
    }
    
    // Check browser compatibility
    const supportCheck = checkPushNotificationSupport();
    if (!supportCheck.supported) {
      return false;
    }
    
    // Check if permission is already granted
    if (Notification.permission !== 'granted') {
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) {
        return false;
      }
      
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (swError) {
      console.error('Service worker error during subscription check:', swError);
      return false;
    }
  } catch (error) {
    console.error('Error checking push notification subscription:', error);
    return false;
  }
};

/**
 * Convert a base64 string to Uint8Array for push subscription
 * @param base64String - Base64 encoded string
 * @returns Uint8Array
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};
