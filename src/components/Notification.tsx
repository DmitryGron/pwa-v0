'use client';

import { useCallback, useEffect, useState } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationPosition = 'top-right' | 'below-trigger';

export type NotificationProps = {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose?: () => void;
  actions?: {
    text: string;
    onClick: () => void;
  }[];
  position?: NotificationPosition;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const Notification = ({
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
  actions = [],
  position = 'top-right',
  triggerRef,
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red',
  };
  
  const handleClose = useCallback(() => {
    setIsExiting(true);
    
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  }, [onClose]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
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

  const getPositionStyles = () => {
    if (position === 'below-trigger' && triggerRef?.current) {
      const element = triggerRef.current;
      const rect = element.getBoundingClientRect();
      const left = rect.left;
      const top = rect.bottom + 8;
      return { top: `${top}px`, left: `${left}px`, transform: 'none' };
    }
    return {};
  };
  
  const positionStyles = getPositionStyles();
  
  const positionClasses = position === 'below-trigger'
    ? 'absolute'
    : '';
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
