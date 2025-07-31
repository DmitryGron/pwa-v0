import { detectDevice } from './deviceDetection';

const getBrowserVersion = (userAgent: string = navigator.userAgent): number => {
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  if (isIOS) {
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/i);
    return match ? parseInt(match[1], 10) : 0;
  }
  
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

export const checkPushNotificationSupport = (): { supported: boolean; message?: string } => {
  const serviceWorkerSupported = 'serviceWorker' in navigator;
  const pushManagerSupported = 'PushManager' in window;
  const notificationSupported = 'Notification' in window;
  
  if (!serviceWorkerSupported || !pushManagerSupported || !notificationSupported) {
    return { 
      supported: false, 
      message: 'Push notifications are not supported in this browser'
    };
  }
  
  const device = detectDevice();
  const browserVersion = getBrowserVersion();
  
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
  
  if (device.browser === 'other' && /trident|msie/i.test(navigator.userAgent)) {
    return {
      supported: false,
      message: 'Push notifications are not supported in Internet Explorer'
    };
  }
  
  if (device.browser === 'other' && /samsungbrowser/i.test(navigator.userAgent)) {
    if (browserVersion < 7) {
      return {
        supported: false,
        message: 'Push notifications may not be fully supported in this browser version'
      };
    }
  }
  
  if (device.browser === 'chrome' && device.os === 'android' && browserVersion < 50) {
    return {
      supported: true,
      message: 'Push notifications may not work reliably on this browser version'
    };
  }
  
  if (device.browser === 'firefox' && device.os === 'android' && browserVersion < 48) {
    return {
      supported: true,
      message: 'Push notifications may not work reliably on this browser version'
    };
  }
  
  return { supported: true };
};

export const subscribeToPushNotifications = async (serverPublicKey: string): Promise<PushSubscription | null | { error: string }> => {
  try {
    if (!('Notification' in window)) {
      return { error: 'Notifications API not supported in this browser' };
    }
    
    const supportCheck = checkPushNotificationSupport();
    const device = detectDevice();
    
    if (!supportCheck.supported) {
      console.error(`Push notification not supported: ${supportCheck.message}`);
      return { error: supportCheck.message || 'Push notifications are not supported on this device' };
    }
    
    let permission = Notification.permission;
    
    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission();
      } catch (permissionError) {
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
    
    if (supportCheck.message) {
      console.warn(supportCheck.message);
    }
    
    if (!('serviceWorker' in navigator)) {
      return { error: 'Service Worker API not supported in this browser' };
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration.pushManager) {
        return { error: 'Push Manager API not available' };
      }
      
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        try {
          const applicationServerKey = urlBase64ToUint8Array(serverPublicKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });
        } catch (subscriptionError) {
          if (subscriptionError instanceof DOMException && 
              subscriptionError.name === 'NotAllowedError') {
            return { error: 'Push permission denied by the user or system' };
          }
          
          if (device.os === 'ios') {
            return { error: 'iOS requires adding the app to home screen for push notifications' };
          }
          
          throw subscriptionError;
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

export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    console.log('Starting unsubscribe process...');
    
    if (!('serviceWorker' in navigator)) {
      console.error('Service worker not available');
      return false;
    }
    
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker registration ready');
    
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
      return true;
    }
  } catch (error) {
    console.error('Error in unsubscribe process:', error);
    return false;
  }
};

export const isPushNotificationSubscribed = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator) || 
        !('PushManager' in window) || 
        !('Notification' in window)) {
      return false;
    }
    
    const supportCheck = checkPushNotificationSupport();
    if (!supportCheck.supported) {
      return false;
    }
    
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
