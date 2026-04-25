import React, { useState, useCallback } from 'react';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutContext';

interface KeyboardShortcutHelpProps {
  className?: string;
}

export const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({ className = '' }) => {
  const { shortcuts } = useKeyboardShortcuts();
  const [isOpen, setIsOpen] = useState(false);

  const toggleHelp = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const shortcutList = Array.from(shortcuts.entries())
    .filter(([_, shortcut]) => shortcut.enabled !== false)
    .map(([key, shortcut]) => ({
      key,
      description: shortcut.description,
    }));

  if (shortcutList.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleHelp}
        className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
        aria-label="Show keyboard shortcuts"
      >
        ⌨️ Shortcuts
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleHelp}
            aria-hidden="true"
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border border-border rounded-lg shadow-lg p-6 z-50 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={toggleHelp}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close keyboard shortcuts"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {shortcutList.map(({ key, description }) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-border/50">
                  <kbd className="px-2 py-1 text-xs bg-muted rounded font-mono">
                    {key}
                  </kbd>
                  <span className="text-sm text-muted-foreground ml-4">
                    {description}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">?</kbd> to toggle this help dialog.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
