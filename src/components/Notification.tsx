'use client';

import { useCallback, useEffect, useState } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationPosition = 'top-right' | 'below-trigger';  // Add more positions as needed

export type NotificationProps = {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  duration?: number; // in milliseconds, 0 means it won't auto-dismiss
  onClose?: () => void;
  actions?: {
    text: string;
    onClick: () => void;
  }[];
  position?: NotificationPosition;
  // Using a more flexible type for the ref that accepts HTMLButtonElement and null
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const Notification = ({
  title,
  message,
  type = 'info',
  duration = 5000, // Default to 5 seconds
  onClose,
  actions = [],
  position = 'top-right',
  triggerRef,
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Color mappings based on notification type
  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red',
  };
  
  const handleClose = useCallback(() => {
    setIsExiting(true);
    
    // Wait for exit animation to complete before removing
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300); // Animation duration
  }, [onClose]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Auto-dismiss after duration (if duration > 0)
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [duration, handleClose]);

  if (!isVisible) return null;

  // Calculate position styles only for below-trigger positioning
  const getPositionStyles = () => {
    if (position === 'below-trigger' && triggerRef?.current) {
      // We know current is an HTMLElement if it's not null
      const element = triggerRef.current;
      const rect = element.getBoundingClientRect();
      const left = rect.left;
      const top = rect.bottom + 8; // 8px below the button
      return { top: `${top}px`, left: `${left}px`, transform: 'none' };
    }
    
    // No inline styles for top-right since it's handled by the flex container
    return {};
  };
  
  const positionStyles = getPositionStyles();
  
  // Determine classes based on position
  const positionClasses = position === 'below-trigger'
    ? 'absolute' // For below-trigger, we'll use absolute positioning with inline styles
    : ''; // For top-right, no positioning on individual notifications since it's handled by the container
  
  // Determine animation based on position
  const animationClass = isExiting
    ? position === 'top-right' ? 'opacity-0 translate-x-4' : 'opacity-0'
    : 'opacity-100';

  return (
    <div
      className={`w-80 text-white rounded-lg shadow-lg transition-all duration-300 ${typeStyles[type]} ${positionClasses} ${animationClass}`}
      style={positionStyles}
    >
      <div className="flex justify-between items-start p-4">
        <div className="flex-1 mr-4">
          <h3 className="mb-1 text-lg font-bold">{title}</h3>
          <p className="text-sm">{message}</p>
          
          {actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    handleClose();
                  }}
                  className="px-2 py-1 text-xs font-medium text-gray-800 bg-white rounded"
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="text-xl leading-none text-white bg-transparent border-none"
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
