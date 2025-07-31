'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import Notification, { NotificationProps } from '../components/Notification';

// Omit props that are managed by the context
type ShowNotificationOptions = Omit<NotificationProps, 'id' | 'onClose' | 'verticalPosition'>;

interface NotificationContextType {
  showNotification: (options: ShowNotificationOptions) => string;
  dismissNotification: (id: string) => void;
  closeAllNotifications: () => void;
  registerServiceWorker: () => Promise<ServiceWorkerRegistration | null>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const showNotification = useCallback((options: ShowNotificationOptions): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { ...options, id, onClose: () => dismissNotification(id) }
    ]);
    
    return id;
  }, [dismissNotification]);

  // dismissNotification is defined above showNotification to avoid circular dependency

  const closeAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Define service worker registration function within the provider
  // This function is used to register the service worker for push notifications
  const registerServiceWorker = useCallback(async () => {
    // Safely check if we're in a browser environment
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered with scope:', registration.scope);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Provide context value
  const contextValue = useMemo(() => ({
    showNotification,
    dismissNotification,
    closeAllNotifications,
    registerServiceWorker, // Include in the context for use elsewhere
  }), [showNotification, dismissNotification, closeAllNotifications, registerServiceWorker]);

  // Register service worker for push notifications
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // Use the existing utility function to register the service worker
      registerServiceWorker()
        .catch(error => console.error('Error registering service worker:', error));
    }
  }, [registerServiceWorker]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Container for notifications with consistent spacing */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-4">
        {notifications.map(notification => (
          <Notification key={notification.id} {...notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
