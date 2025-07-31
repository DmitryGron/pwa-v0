'use client';

import { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsDemo = () => {
  const {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notify,
    subscribeToPush,
    unsubscribeFromPush,
    isPushEnabled,
  } = useNotifications();

  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);

  // Check if push is enabled on component mount
  const checkPushStatus = async () => {
    const isEnabled = await isPushEnabled();
    setPushEnabled(isEnabled);
  };

  // Request push notification permissions (normally you would use a real VAPID key)
  const handleSubscribeToPush = async () => {
    const success = await subscribeToPush('some-vapid-key');
    if (success) {
      setPushEnabled(true);
    }
  };

  // Unsubscribe from push notifications
  const handleUnsubscribeFromPush = async () => {
    try {
      console.log('Starting unsubscribe in demo page...');
      const success = await unsubscribeFromPush();
      console.log('Unsubscribe result from hook:', success);

      // Force a recheck of the push status
      setTimeout(async () => {
        console.log('Rechecking push status after unsubscribe...');
        await checkPushStatus();
      }, 500); // Small delay to ensure service worker state is updated
    } catch (error) {
      console.error('Unsubscribe handler error:', error);
      // Still try to check status even if there was an error
      await checkPushStatus();
    }
  };

  // Examples of different notification types

  // Examples of different notification types
  const showSuccessNotification = () => {
    notifySuccess({
      title: 'Success!',
      message: 'Your operation was completed successfully.'
    });
  };

  const showErrorNotification = () => {
    notifyError({
      title: 'Error!',
      message: 'Something went wrong. Please try again.'
    });
  };

  const showWarningNotification = () => {
    notifyWarning({
      title: 'Warning!',
      message: 'This action might have consequences.'
    });
  };

  const showInfoNotification = () => {
    notifyInfo({
      title: 'Information',
      message: 'Here is some information you might find useful.'
    });
  };

  // Example with actions
  const showNotificationWithActions = () => {
    notify('Confirmation Required', 'Do you want to continue with this action?', 'warning', 0, [
      {
        text: 'Yes',
        onClick: () => notifySuccess({
          title: 'Confirmed',
          message: 'You confirmed the action'
        }),
      },
      {
        text: 'No',
        onClick: () => notifyInfo({
          title: 'Cancelled',
          message: 'You cancelled the action'
        }),
      },
    ]);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <button 
        onClick={() => window.history.back()} 
        className="inline-block px-4 py-2 mb-4 text-sm bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        &larr; Back to Home
      </button>

      <h1 className="mb-6 text-3xl font-bold">Notifications Demo</h1>

      <div className="space-y-6">
        {/* <section className="p-4 rounded-lg border">
          <h2 className="mb-4 text-xl font-bold">In-App Notifications</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={showSuccessNotification}
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
              Success
            </button>
            
            <button 
              onClick={showErrorNotification}
              className="px-4 py-2 text-white rounded bg-red hover:bg-red-600"
            >
              Error
            </button>
            
            <button 
              onClick={showWarningNotification}
              className="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600"
            >
              Warning
            </button>
            
            <button 
              onClick={showInfoNotification}
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Info
            </button>
            
            <button 
              onClick={showNotificationWithActions}
              className="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              With Actions
            </button>
          </div>
        </section> */}

        <section className="p-4 rounded-lg border">
          <h2 className="mb-4 text-xl font-bold">Push Notifications</h2>

          <div className="mb-4">
            <button
              onClick={checkPushStatus}
              className="px-4 py-2 mr-2 text-white bg-gray-500 rounded hover:bg-gray-600"
            >
              Check Push Status
            </button>

            {pushEnabled !== null && (
              <span className={`text-sm ${pushEnabled ? 'text-green-500' : 'text-red-500'}`}>
                Push notifications are currently {pushEnabled ? 'enabled' : 'disabled'}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubscribeToPush}
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
              disabled={pushEnabled === true}
            >
              Enable Push
            </button>

            <button
              onClick={handleUnsubscribeFromPush}
              className="px-4 py-2 text-white rounded bg-red hover:bg-red-600"
              disabled={pushEnabled === false}
            >
              Disable Push
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>Note: Push notifications require:</p>
            <ul className="pl-5 mt-1 list-disc">
              <li>HTTPS connection (except on localhost)</li>
              <li>A valid VAPID key from your backend server</li>
              <li>Server implementation to send push messages</li>
            </ul>

            <p className="mt-2 font-medium">Platform-specific requirements:</p>
            <ul className="pl-5 mt-1 list-disc">
              <li><span className="font-medium">Android:</span> Supported in Chrome, Firefox, and other browsers</li>
              <li><span className="font-medium">iOS:</span> Requires iOS 16.4+ and must be added to home screen</li>
              <li>To change browser notification permissions, visit your browser settings</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="mb-2 font-bold">About this Notification System:</h3>
        <ul className="pl-5 list-disc">
          <li>In-app notifications with different styles and auto-dismiss</li>
          <li>Support for action buttons within notifications</li>
          <li>Push notification support for desktop and mobile PWAs</li>
          <li>Prompts for notification permission and PWA installation</li>
          <li>Consistent UI style across all notification types</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationsDemo;
