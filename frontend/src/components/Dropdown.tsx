import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
}

export interface DropdownProps {
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
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
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
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find(item => item.value === value);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'right-0';
      case 'top-left':
        return 'bottom-full left-0 mb-1';
      case 'top-right':
        return 'bottom-full right-0 mb-1';
      case 'bottom-left':
      default:
        return 'left-0';
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

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
            absolute z-50 w-full rounded-md border border-gray-200 bg-white shadow-lg
            ${getPositionClasses()}
            ${menuClassName}
          `}
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

export default Dropdown;
