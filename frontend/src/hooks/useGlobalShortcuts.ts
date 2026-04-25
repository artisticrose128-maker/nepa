import { useCallback, useRef } from 'react';
import { useShortcut } from '../contexts/KeyboardShortcutContext';
import { useTheme } from '../contexts/ThemeContext';
import { announceToScreenReader } from '../utils/accessibility';

export const useGlobalShortcuts = () => {
  const { toggleTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const helpDialogRef = useRef<HTMLDialogElement>(null);

  // Toggle theme (Ctrl/Cmd + Shift + T)
  useShortcut({
    key: 't',
    ctrlKey: true,
    shiftKey: true,
    description: 'Toggle theme',
    action: () => {
      toggleTheme();
      announceToScreenReader('Theme toggled');
    },
  });

  // Focus search (Ctrl/Cmd + K)
  useShortcut({
    key: 'k',
    ctrlKey: true,
    description: 'Focus search input',
    action: () => {
      const searchInput = document.querySelector('input[placeholder*="search"], input[placeholder*="Search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        announceToScreenReader('Search input focused');
      } else {
        announceToScreenReader('Search input not found');
      }
    },
  });

  // Help dialog (?)
  useShortcut({
    key: '?',
    description: 'Show keyboard shortcuts help',
    action: () => {
      const helpButton = document.querySelector('button[aria-label*="keyboard shortcuts"]') as HTMLButtonElement;
      if (helpButton) {
        helpButton.click();
      }
    },
  });

  // Navigate to dashboard (Ctrl/Cmd + 1)
  useShortcut({
    key: '1',
    ctrlKey: true,
    description: 'Navigate to dashboard',
    action: () => {
      const dashboardLink = document.querySelector('a[href*="dashboard"], nav a:first-child') as HTMLAnchorElement;
      if (dashboardLink) {
        dashboardLink.click();
        announceToScreenReader('Navigated to dashboard');
      }
    },
  });

  // Navigate to payments (Ctrl/Cmd + 2)
  useShortcut({
    key: '2',
    ctrlKey: true,
    description: 'Navigate to payments',
    action: () => {
      const paymentsLink = document.querySelector('a[href*="payment"], a[href*="bill"]') as HTMLAnchorElement;
      if (paymentsLink) {
        paymentsLink.click();
        announceToScreenReader('Navigated to payments');
      }
    },
  });

  // Navigate to analytics (Ctrl/Cmd + 3)
  useShortcut({
    key: '3',
    ctrlKey: true,
    description: 'Navigate to analytics',
    action: () => {
      const analyticsLink = document.querySelector('a[href*="analytics"], a[href*="chart"]') as HTMLAnchorElement;
      if (analyticsLink) {
        analyticsLink.click();
        announceToScreenReader('Navigated to analytics');
      }
    },
  });

  // New payment (Ctrl/Cmd + N)
  useShortcut({
    key: 'n',
    ctrlKey: true,
    description: 'Create new payment',
    action: () => {
      const newPaymentButton = document.querySelector('button[aria-label*="new payment"], button:contains("New Payment"), button:contains("Pay Bill")') as HTMLButtonElement;
      if (newPaymentButton) {
        newPaymentButton.click();
        announceToScreenReader('New payment form opened');
      }
    },
  });

  // Refresh data (Ctrl/Cmd + R)
  useShortcut({
    key: 'r',
    ctrlKey: true,
    description: 'Refresh data',
    action: () => {
      const refreshButton = document.querySelector('button[aria-label*="refresh"], button:contains("Refresh")') as HTMLButtonElement;
      if (refreshButton) {
        refreshButton.click();
        announceToScreenReader('Data refreshed');
      } else {
        window.location.reload();
      }
    },
  });

  // Escape to close modals/dropdowns
  useShortcut({
    key: 'Escape',
    description: 'Close modal or dropdown',
    action: () => {
      // Close any open dialogs
      const openDialog = document.querySelector('dialog[open]') as HTMLDialogElement;
      if (openDialog) {
        openDialog.close();
        announceToScreenReader('Dialog closed');
        return;
      }

      // Close any open dropdowns
      const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
      openDropdowns.forEach(dropdown => {
        (dropdown as HTMLElement).click();
      });
      
      if (openDropdowns.length > 0) {
        announceToScreenReader('Dropdowns closed');
      }

      // Remove focus from any focused element
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
  });

  return {
    searchInputRef,
    helpDialogRef,
  };
};
