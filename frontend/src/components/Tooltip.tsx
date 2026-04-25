import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  arrow?: boolean;
  maxWidth?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface TooltipContentProps {
  content: React.ReactNode;
  position: TooltipPosition;
  arrow: boolean;
  maxWidth: number;
  className?: string;
  triggerRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
}

const TooltipContent: React.FC<TooltipContentProps> = ({
  content,
  position,
  arrow,
  maxWidth,
  className,
  triggerRef,
  isOpen,
}) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = contentRef.current;
      
      if (!trigger || !tooltip) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
          y = triggerRect.top + scrollTop - tooltipRect.height - 8;
          break;
        case 'bottom':
          x = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
          y = triggerRect.top + scrollTop + triggerRect.height + 8;
          break;
        case 'left':
          x = triggerRect.left + scrollLeft - tooltipRect.width - 8;
          y = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
          break;
        case 'right':
          x = triggerRect.left + scrollLeft + triggerRect.width + 8;
          y = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
          break;
        case 'center':
          x = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
          y = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
          break;
      }

      // Keep tooltip within viewport
      const padding = 8;
      x = Math.max(padding, Math.min(x, window.innerWidth + scrollLeft - tooltipRect.width - padding));
      y = Math.max(padding, Math.min(y, window.innerHeight + scrollTop - tooltipRect.height - padding));

      setCoords({ x, y });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, position, triggerRef]);

  if (!isOpen) return null;

  const baseClasses = `
    absolute z-[1070] p-3 text-sm rounded-lg shadow-lg
    transition-all duration-150 ease-in-out
    ${theme === 'dark' 
      ? 'bg-gray-900 text-white border border-gray-700' 
      : 'bg-white text-gray-900 border border-gray-200'
    }
    ${className || ''}
  `;

  const arrowClasses = `
    absolute w-0 h-0 border-4 border-transparent
    ${theme === 'dark' ? 'border-gray-900' : 'border-white'}
  `;

  return (
    <div
      ref={contentRef}
      className={baseClasses}
      style={{
        left: coords.x,
        top: coords.y,
        maxWidth: maxWidth ? `${maxWidth}px` : '300px',
      }}
      role="tooltip"
    >
      {content}
      {arrow && (
        <div
          className={arrowClasses}
          style={{
            [position === 'top' ? 'bottom' : 
             position === 'bottom' ? 'top' :
             position === 'left' ? 'right' : 'left']: '-8px',
            [position === 'top' || position === 'bottom' ? 'left' : 'top']: '50%',
            [position === 'top' || position === 'bottom' ? 'marginLeft' : 'marginTop']: '-4px',
            borderTopColor: position === 'bottom' ? (theme === 'dark' ? '#1f2937' : '#ffffff') : 'transparent',
            borderBottomColor: position === 'top' ? (theme === 'dark' ? '#1f2937' : '#ffffff') : 'transparent',
            borderLeftColor: position === 'right' ? (theme === 'dark' ? '#1f2937' : '#ffffff') : 'transparent',
            borderRightColor: position === 'left' ? (theme === 'dark' ? '#1f2937' : '#ffffff') : 'transparent',
          }}
        />
      )}
    </div>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  delay = 300,
  disabled = false,
  className,
  contentClassName,
  arrow = true,
  maxWidth = 300,
  open,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();

  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open : (trigger === 'manual' ? isManualOpen : isOpen);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (trigger === 'click' || trigger === 'manual') {
      const newOpen = !actualOpen;
      setIsManualOpen(newOpen);
      onOpenChange?.(newOpen);
    } else {
      setIsOpen(true);
      onOpenChange?.(true);
    }
  }, [disabled, trigger, actualOpen, onOpenChange]);

  const handleClose = useCallback(() => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (trigger === 'click' || trigger === 'manual') {
      setIsManualOpen(false);
      onOpenChange?.(false);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        onOpenChange?.(false);
      }, delay);
    }
  }, [disabled, trigger, delay, onOpenChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (event.key === 'Escape' && actualOpen) {
      handleClose();
    }
    
    if ((event.key === 'Enter' || event.key === ' ') && trigger === 'click') {
      event.preventDefault();
      handleOpen();
    }
  }, [disabled, actualOpen, trigger, handleOpen, handleClose]);

  const eventHandlers = React.useMemo(() => {
    if (disabled) return {};

    const handlers: any = {
      onKeyDown: handleKeyDown,
    };

    switch (trigger) {
      case 'hover':
        handlers.onMouseEnter = handleOpen;
        handlers.onMouseLeave = handleClose;
        handlers.onFocus = handleOpen;
        handlers.onBlur = handleClose;
        break;
      case 'focus':
        handlers.onFocus = handleOpen;
        handlers.onBlur = handleClose;
        break;
      case 'click':
        handlers.onClick = handleOpen;
        handlers.onFocus = handleOpen;
        handlers.onBlur = handleClose;
        break;
      case 'manual':
        // No automatic handlers for manual trigger
        break;
    }

    return handlers;
  }, [disabled, trigger, handleOpen, handleClose, handleKeyDown]);

  const enhancedChildren = React.cloneElement(children, {
    ...eventHandlers,
    ...children.props,
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      if (typeof children.ref === 'function') {
        children.ref(node);
      } else if (children.ref) {
        (children.ref as any).current = node;
      }
    },
    'aria-describedby': actualOpen ? 'tooltip-content' : undefined,
    'tabIndex': children.props.tabIndex ?? 0,
  });

  return (
    <div className={`relative inline-block ${className || ''}`}>
      {enhancedChildren}
      <TooltipContent
        content={content}
        position={position}
        arrow={arrow}
        maxWidth={maxWidth}
        className={contentClassName}
        triggerRef={triggerRef}
        isOpen={actualOpen}
      />
    </div>
  );
};

export default Tooltip;
