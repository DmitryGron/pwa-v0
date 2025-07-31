'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import Notification, { NotificationProps } from '../components/Notification';

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

  const closeAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const registerServiceWorker = useCallback(async () => {
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

  const contextValue = useMemo(() => ({
    showNotification,
    dismissNotification,
    closeAllNotifications,
    registerServiceWorker,
  }), [showNotification, dismissNotification, closeAllNotifications, registerServiceWorker]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      registerServiceWorker()
        .catch(error => console.error('Error registering service worker:', error));
    }
  }, [registerServiceWorker]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="flex fixed top-4 right-4 z-50 flex-col gap-4">
        {notifications.map(notification => (
          <Notification key={notification.id} {...notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
