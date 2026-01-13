import React from 'react';
import { useToast } from '../../hooks/useToast';

const Toast: React.FC = () => {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
        return 'toast-info';
      default:
        return '';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${getTypeStyles(toast.type)}`}>
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => remove(toast.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
