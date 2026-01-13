import { useState, useCallback } from 'react';
import { APP_CONFIG } from '../constants/config';

interface UseClipboardReturn {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

export const useClipboard = (
  resetDelay: number = APP_CONFIG.CLIPBOARD_RESET_DELAY
): UseClipboardReturn => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, resetDelay);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    },
    [resetDelay]
  );

  return { copied, copyToClipboard };
};
