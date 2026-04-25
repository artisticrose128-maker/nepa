import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { calculateDropdownPosition, getViewportInfo, getPositionClasses } from '../utils/dropdownPositioning';
import { DropdownItem } from './Dropdown';

export interface ResponsiveDropdownProps {
  items: DropdownItem[];
  value?: string | number;
  onSelect: (item: DropdownItem) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showSelectedIcon?: boolean;
  searchable?: boolean;
  maxHeight?: number;
  closeOnSelect?: boolean;
  mobileFullscreen?: boolean;
  mobileModalTitle?: string;
  breakpoint?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
}

const ResponsiveDropdown: React.FC<ResponsiveDropdownProps> = ({
  items,
  value,
  onSelect,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  position = 'bottom-left',
  size = 'md',
  variant = 'default',
  showSelectedIcon = true,
  searchable = false,
  maxHeight = 300,
  closeOnSelect = true,
  mobileFullscreen = true,
  mobileModalTitle = 'Select an option',
  breakpoint = 768,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find(item => item.value === value);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  // Calculate menu position for desktop
  const updateMenuPosition = useCallback(() => {
    if (!isMobile && triggerRef.current && menuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewport = getViewportInfo();

      const position = calculateDropdownPosition({
        triggerRect,
        menuRect: {
          ...menuRect,
          width: menuRef.current.offsetWidth || triggerRect.width,
          height: Math.min(maxHeight, filteredItems.length * 48)
        },
        viewport,
        preferredPosition: position
      });

      setMenuPosition({ top: position.top, left: position.left });
    }
  }, [isMobile, position, maxHeight, filteredItems?.length]);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update menu position when opened
  useEffect(() => {
    if (isOpen && !isMobile) {
      updateMenuPosition();
    }
  }, [isOpen, isMobile, updateMenuPosition]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle scroll/resize for desktop
  useEffect(() => {
    if (isOpen && !isMobile) {
      const handleScroll = () => updateMenuPosition();
      const handleResize = () => {
        setIsMobile(window.innerWidth < breakpoint);
        updateMenuPosition();
      };

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, isMobile, updateMenuPosition, breakpoint]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex >= filteredItems.length ? 0 : nextIndex;
          });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => {
            const prevIndex = prev - 1;
            return prevIndex < 0 ? filteredItems.length - 1 : prevIndex;
          });
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [disabled, isOpen, highlightedIndex, filteredItems]);

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;
    onSelect(item);
    if (closeOnSelect) {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-sm min-h-[32px]';
      case 'lg':
        return 'px-4 py-3 text-base min-h-[48px]';
      case 'md':
      default:
        return 'px-3 py-2 text-sm min-h-[40px]';
    }
  };

  // Variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 focus:ring-2 focus:ring-blue-500';
      case 'default':
      default:
        return 'bg-white border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500';
    }
  };

  const getItemSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-sm';
      case 'lg':
        return 'px-4 py-3 text-base';
      case 'md':
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  // Mobile Modal
  if (isMobile && mobileFullscreen) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef} id={id}>
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            inline-flex items-center justify-between w-full rounded-md
            ${getSizeClasses()}
            ${getVariantClasses()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${triggerClassName}
          `}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="flex items-center gap-2 truncate">
            {selectedItem?.icon}
            <span className="truncate">
              {selectedItem?.label || placeholder}
            </span>
            {selectedItem?.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {selectedItem.badge}
              </span>
            )}
          </span>
          <span className="ml-2 flex-shrink-0">
            {isOpen ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </span>
        </button>

        {/* Mobile Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
            <div className="bg-white w-full rounded-t-xl max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">{mobileModalTitle}</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              {searchable && (
                <div className="p-4 border-b border-gray-200">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setHighlightedIndex(-1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-gray-500 text-center">
                    No options available
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={item.value === value}
                      aria-disabled={item.disabled}
                      className={`
                        ${getItemSizeClasses()}
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
                        ${item.value === value ? 'bg-blue-50 text-blue-700' : ''}
                        ${index === highlightedIndex ? 'bg-gray-100' : ''}
                        flex items-center gap-3 border-b border-gray-100 last:border-b-0
                      `}
                      onClick={() => handleSelect(item)}
                    >
                      {item.icon && (
                        <span className="flex-shrink-0">{item.icon}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {item.badge}
                        </span>
                      )}
                      {showSelectedIcon && item.value === value && (
                        <Check className="w-5 h-5 flex-shrink-0 text-blue-600" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef} id={id}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          inline-flex items-center justify-between w-full rounded-md
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${triggerClassName}
        `}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={highlightedIndex >= 0 ? `dropdown-item-${filteredItems[highlightedIndex]?.id}` : undefined}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedItem?.icon}
          <span className="truncate">
            {selectedItem?.label || placeholder}
          </span>
          {selectedItem?.badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {selectedItem.badge}
            </span>
          )}
        </span>
        <span className="ml-2 flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            fixed z-50 w-full rounded-md border border-gray-200 bg-white shadow-lg
            ${menuClassName}
          `}
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
          role="listbox"
          aria-label={ariaLabel || 'Dropdown options'}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Menu Items */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {filteredItems.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options available
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  id={`dropdown-item-${item.id}`}
                  role="option"
                  aria-selected={item.value === value}
                  aria-disabled={item.disabled}
                  className={`
                    ${getItemSizeClasses()}
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
                    ${item.value === value ? 'bg-blue-50 text-blue-700' : ''}
                    ${index === highlightedIndex ? 'bg-gray-100' : ''}
                    flex items-center gap-2
                  `}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                >
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {item.badge}
                    </span>
                  )}
                  {showSelectedIcon && item.value === value && (
                    <Check className="w-4 h-4 flex-shrink-0 text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveDropdown;
