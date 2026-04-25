import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

interface KeyboardShortcutContextType {
  shortcuts: Map<string, KeyboardShortcut>;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
  isShortcutEnabled: (key: string) => boolean;
  toggleShortcut: (key: string) => void;
  getShortcutKey: (shortcut: KeyboardShortcut) => string;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | null>(null);

export const KeyboardShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());

  const getShortcutKey = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.metaKey) parts.push('Meta');
    parts.push(shortcut.key);
    return parts.join('+');
  }, []);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const key = getShortcutKey(shortcut);
    shortcutsRef.current.set(key, { ...shortcut, enabled: shortcut.enabled !== false });
  }, [getShortcutKey]);

  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current.delete(key);
  }, []);

  const isShortcutEnabled = useCallback((key: string): boolean => {
    const shortcut = shortcutsRef.current.get(key);
    return shortcut?.enabled !== false;
  }, []);

  const toggleShortcut = useCallback((key: string) => {
    const shortcut = shortcutsRef.current.get(key);
    if (shortcut) {
      shortcut.enabled = !shortcut.enabled;
      shortcutsRef.current.set(key, shortcut);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const parts: string[] = [];
      if (event.ctrlKey) parts.push('Ctrl');
      if (event.altKey) parts.push('Alt');
      if (event.shiftKey) parts.push('Shift');
      if (event.metaKey) parts.push('Meta');
      parts.push(event.key);
      
      const key = parts.join('+');
      const shortcut = shortcutsRef.current.get(key);
      
      if (shortcut && shortcut.enabled !== false) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        event.stopPropagation();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: KeyboardShortcutContextType = {
    shortcuts: shortcutsRef.current,
    registerShortcut,
    unregisterShortcut,
    isShortcutEnabled,
    toggleShortcut,
    getShortcutKey,
  };

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
};

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  return context;
};

export const useShortcut = (shortcut: KeyboardShortcut) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut(shortcut);
    return () => unregisterShortcut(shortcut.key);
  }, [shortcut, registerShortcut, unregisterShortcut]);
};
