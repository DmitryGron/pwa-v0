import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { NotificationType } from '../components/Notification';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications, isPushNotificationSubscribed } from '../utils/pushNotifications';

type NotificationsType = {
  title: string;
  message: string;
  duration?: number;
  actions?: { text: string; onClick: () => void }[];
};

export const useNotifications = () => {
  const { showNotification, dismissNotification, closeAllNotifications } = useNotification();
  
  const notify = useCallback((
    title: string, 
    message: string, 
    type: NotificationType = 'info',
    duration = 5000,
    actions: { text: string; onClick: () => void }[] = []
  ) => {
    return showNotification({
      title,
      message,
      type,
      duration,
      actions,
    });
  }, [showNotification]);
  
  const notifySuccess = useCallback(({title, message, duration, actions}: NotificationsType): string => {
    return notify(title, message, 'success', duration, actions);
  }, [notify]);
  
  const notifyError = useCallback(({title, message, duration, actions}: NotificationsType): string => {
    return notify(title, message, 'error', duration, actions);
  }, [notify]);
  
  const notifyWarning = useCallback(({title, message, duration, actions}: NotificationsType): string => {
    return notify(title, message, 'warning', duration, actions);
  }, [notify]);
  
  const notifyInfo = useCallback(({title, message, duration, actions}: NotificationsType): string => {
    return notify(title, message, 'info', duration, actions);
  }, [notify]);
  
  const subscribeToPush = useCallback(async (serverPublicKey: string): Promise<boolean> => {
    try {
      const result = await subscribeToPushNotifications(serverPublicKey);
      
      if (result && typeof result === 'object' && 'error' in result) {
        const errorMessage = result.error;
        
        if (errorMessage.includes('iOS')) {
          notifyWarning({
            title: 'iOS Requirements', 
            message: errorMessage,
            duration: 8000,
          });
        } else {
          notifyError({
            title: 'Notification Error', 
            message: errorMessage,
            duration: 5000,
          });
        }
        return false;
      }
      
      if (result) {
        notifySuccess({
          title: 'Notifications Enabled', 
          message: 'You will now receive notifications from our app.',
          duration: 5000,
        });
        return true;
      } else {
        notifyError({
          title: 'Notification Error', 
          message: 'Failed to subscribe to push notifications.',
          duration: 5000,
        });
        return false;
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      notifyError({
        title: 'Notification Error', 
        message: 'An error occurred while enabling notifications.',
        duration: 5000,
      });
      return false;
    }
  }, [notifySuccess, notifyError, notifyWarning]);
  
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Attempting to unsubscribe from push notifications...');
      
      const success = await unsubscribeFromPushNotifications();
      
      console.log('Unsubscribe operation returned:', success);
      
      if (success) {
        notifyInfo({
          title: 'Notifications Disabled', 
          message: 'You will no longer receive notifications from our app.',
          duration: 5000,
        });
        return true;
      } else {
        console.warn('Unsubscribe from push returned false');
        notifyError({
          title: 'Notification Error', 
          message: 'Failed to unsubscribe from push notifications. Please try again or check browser settings.',
          duration: 5000,
        });
        return false;
      }
    } catch (error) {
      console.error('Push unsubscription error:', error);
      notifyError({
        title: 'Notification Error', 
        message: 'An error occurred while disabling notifications. Please try again later.',
        duration: 5000,
      });
      return false;
    }
  }, [notifyInfo, notifyError]);
  
  const isPushEnabled = useCallback(async (): Promise<boolean> => {
    return await isPushNotificationSubscribed();
  }, []);
  
  return {
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    dismissNotification,
    closeAllNotifications,
    subscribeToPush,
    unsubscribeFromPush,
    isPushEnabled,
    showNotification,
  };
};
