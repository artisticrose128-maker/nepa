import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardShortcutProvider } from '../contexts/KeyboardShortcutContext';
import { useShortcut } from '../contexts/KeyboardShortcutContext';
import React from 'react';

// Mock component for testing shortcuts
const TestComponent: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  useShortcut({
    key: 't',
    ctrlKey: true,
    description: 'Test shortcut',
    action: onAction,
  });

  return <div>Test Component</div>;
};

describe('Keyboard Shortcuts', () => {
  it('should register and trigger keyboard shortcut', () => {
    const mockAction = jest.fn();
    
    render(
      <KeyboardShortcutProvider>
        <TestComponent onAction={mockAction} />
      </KeyboardShortcutProvider>
    );

    // Simulate Ctrl+T key press
    fireEvent.keyDown(document, {
      key: 't',
      ctrlKey: true,
      code: 'KeyT',
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should not trigger shortcut without modifier key', () => {
    const mockAction = jest.fn();
    
    render(
      <KeyboardShortcutProvider>
        <TestComponent onAction={mockAction} />
      </KeyboardShortcutProvider>
    );

    // Simulate T key press without Ctrl
    fireEvent.keyDown(document, {
      key: 't',
      ctrlKey: false,
      code: 'KeyT',
    });

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should prevent default behavior when preventDefault is true', () => {
    const mockAction = jest.fn();
    const mockPreventDefault = jest.fn();
    
    // Mock a event with preventDefault
    const mockEvent = {
      key: 't',
      ctrlKey: true,
      code: 'KeyT',
      preventDefault: mockPreventDefault,
      stopPropagation: jest.fn(),
    } as any;

    Object.defineProperty(document, 'activeElement', {
      value: document.body,
      writable: true,
    });

    render(
      <KeyboardShortcutProvider>
        <TestComponent onAction={mockAction} />
      </KeyboardShortcutProvider>
    );

    // Dispatch the event
    document.dispatchEvent(new KeyboardEvent('keydown', mockEvent));

    expect(mockPreventDefault).toHaveBeenCalled();
  });

  it('should handle multiple modifier keys', () => {
    const mockAction = jest.fn();
    
    const TestComponentWithModifiers: React.FC = () => {
      useShortcut({
        key: 's',
        ctrlKey: true,
        shiftKey: true,
        description: 'Test shortcut with modifiers',
        action: mockAction,
      });

      return <div>Test Component</div>;
    };

    render(
      <KeyboardShortcutProvider>
        <TestComponentWithModifiers />
      </KeyboardShortcutProvider>
    );

    // Simulate Ctrl+Shift+S
    fireEvent.keyDown(document, {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      code: 'KeyS',
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should not trigger when disabled', () => {
    const mockAction = jest.fn();
    
    const TestDisabledComponent: React.FC = () => {
      useShortcut({
        key: 'd',
        description: 'Disabled shortcut',
        action: mockAction,
        enabled: false,
      });

      return <div>Test Component</div>;
    };

    render(
      <KeyboardShortcutProvider>
        <TestDisabledComponent />
      </KeyboardShortcutProvider>
    );

    // Simulate D key press
    fireEvent.keyDown(document, {
      key: 'd',
      code: 'KeyD',
    });

    expect(mockAction).not.toHaveBeenCalled();
  });
});
