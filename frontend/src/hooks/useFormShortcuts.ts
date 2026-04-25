import { useCallback } from 'react';
import { useShortcut } from '../contexts/KeyboardShortcutContext';
import { announceToScreenReader } from '../utils/accessibility';

export const useFormShortcuts = (onSubmit?: () => void, onCancel?: () => void) => {
  // Submit form with Ctrl+Enter or Cmd+Enter
  useShortcut({
    key: 'Enter',
    ctrlKey: true,
    description: 'Submit form',
    action: () => {
      if (onSubmit) {
        onSubmit();
        announceToScreenReader('Form submitted');
      }
    },
    preventDefault: true,
  });

  // Cancel form with Escape
  useShortcut({
    key: 'Escape',
    description: 'Cancel form',
    action: () => {
      if (onCancel) {
        onCancel();
        announceToScreenReader('Form cancelled');
      }
    },
    preventDefault: true,
  });

  // Clear form with Ctrl+Shift+C
  const clearForm = useCallback(() => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    inputs.forEach(input => {
      (input as HTMLInputElement).value = '';
    });
    announceToScreenReader('Form cleared');
  }, []);

  useShortcut({
    key: 'c',
    ctrlKey: true,
    shiftKey: true,
    description: 'Clear form',
    action: clearForm,
    preventDefault: true,
  });

  return {
    clearForm,
  };
};
