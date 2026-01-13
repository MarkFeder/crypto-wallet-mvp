import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import { strings } from '../locales';

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(strings.errors.mustBeUsedWithinProvider('useToast'));
  }

  return {
    toasts: context.toasts,
    success: (message: string) => context.addToast({ type: 'success', message }),
    error: (message: string) => context.addToast({ type: 'error', message }),
    warning: (message: string) => context.addToast({ type: 'warning', message }),
    info: (message: string) => context.addToast({ type: 'info', message }),
    remove: context.removeToast,
  };
};
