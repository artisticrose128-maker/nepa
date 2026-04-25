import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
  locale?: string;
  format12Hour?: boolean;
  minuteStep?: number;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

interface TimeState {
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
}

const TimePicker: React.FC<TimePickerProps> = ({
  value = '',
  onChange,
  disabled = false,
  placeholder = 'Select time',
  locale = 'en-US',
  format12Hour = true,
  minuteStep = 1,
  className = '',
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeState, setTimeState] = useState<TimeState>({
    hours: 0,
    minutes: 0,
    period: 'AM'
  });
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parsed = parseTimeString(value, format12Hour);
      if (parsed) {
        setTimeState(parsed);
        setInputValue(formatTime(parsed, format12Hour));
      }
    }
  }, [value, format12Hour]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || disabled) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleHourChange(1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleHourChange(-1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleMinuteChange(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleMinuteChange(1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, disabled, timeState]);

  const parseTimeString = (timeStr: string, use12Hour: boolean): TimeState | null => {
    if (!timeStr) return null;

    // Try to parse various time formats
    const formats = [
      /^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i,
      /^(\d{1,2})(\d{2})(?:\s*([AP]M))?$/i
    ];

    for (const format of formats) {
      const match = timeStr.match(format);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3]?.toUpperCase() as 'AM' | 'PM' || (hours >= 12 ? 'PM' : 'AM');

        if (!use12Hour) {
          // Convert to 24-hour format for internal state
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        } else {
          // Convert to 12-hour format for display
          if (hours > 12) hours -= 12;
          if (hours === 0) hours = 12;
        }

        return { hours, minutes, period };
      }
    }

    return null;
  };

  const formatTime = (time: TimeState, use12Hour: boolean): string => {
    if (use12Hour) {
      return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')} ${time.period}`;
    } else {
      let hours = time.hours;
      if (time.period === 'PM' && hours < 12) hours += 12;
      if (time.period === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    }
  };

  const handleHourChange = (delta: number) => {
    const maxHour = format12Hour ? 12 : 23;
    const minHour = format12Hour ? 1 : 0;
    
    setTimeState(prev => {
      let newHours = prev.hours + delta;
      if (newHours > maxHour) newHours = minHour;
      if (newHours < minHour) newHours = maxHour;
      
      const newState = { ...prev, hours: newHours };
      const formattedTime = formatTime(newState, format12Hour);
      setInputValue(formattedTime);
      onChange?.(formattedTime);
      
      return newState;
    });
  };

  const handleMinuteChange = (delta: number) => {
    setTimeState(prev => {
      let newMinutes = prev.minutes + delta * minuteStep;
      if (newMinutes >= 60) newMinutes = 0;
      if (newMinutes < 0) newMinutes = 60 - minuteStep;
      
      const newState = { ...prev, minutes: newMinutes };
      const formattedTime = formatTime(newState, format12Hour);
      setInputValue(formattedTime);
      onChange?.(formattedTime);
      
      return newState;
    });
  };

  const handlePeriodChange = () => {
    setTimeState(prev => {
      const newState = { ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' };
      const formattedTime = formatTime(newState, format12Hour);
      setInputValue(formattedTime);
      onChange?.(formattedTime);
      return newState;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseTimeString(newValue, format12Hour);
    if (parsed) {
      setTimeState(parsed);
      onChange?.(formatTime(parsed, format12Hour));
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const generateHourOptions = () => {
    const options = [];
    const start = format12Hour ? 1 : 0;
    const end = format12Hour ? 12 : 23;
    
    for (let i = start; i <= end; i++) {
      options.push(i);
    }
    return options;
  };

  const generateMinuteOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i += minuteStep) {
      options.push(i);
    }
    return options;
  };

  const getLocalizedTime = () => {
    try {
      const now = new Date();
      now.setHours(timeState.hours);
      now.setMinutes(timeState.minutes);
      
      return now.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: format12Hour
      });
    } catch {
      return formatTime(timeState, format12Hour);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleInputClick}
          disabled={disabled}
          placeholder={placeholder}
          id={id}
          aria-label={ariaLabel || 'Time picker'}
          aria-describedby={ariaDescribedBy}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`
            w-full px-3 py-2 pr-10 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${disabled ? 'text-gray-400' : 'text-gray-900'}
            border-gray-300
          `}
        />
        <button
          type="button"
          onClick={handleInputClick}
          disabled={disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          aria-label="Toggle time picker"
        >
          <Clock size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]">
          <div className="space-y-4">
            {/* Time Display */}
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {getLocalizedTime()}
              </div>
            </div>

            {/* Time Controls */}
            <div className="flex items-center justify-center space-x-2">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleHourChange(1)}
                  disabled={disabled}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed hover:bg-gray-100 rounded"
                  aria-label="Increase hour"
                >
                  <ChevronUp size={16} />
                </button>
                <div className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-lg font-medium">
                    {timeState.hours.toString().padStart(2, '0')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleHourChange(-1)}
                  disabled={disabled}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed hover:bg-gray-100 rounded"
                  aria-label="Decrease hour"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="text-2xl text-gray-500 mt-4">:</div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleMinuteChange(1)}
                  disabled={disabled}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed hover:bg-gray-100 rounded"
                  aria-label="Increase minute"
                >
                  <ChevronUp size={16} />
                </button>
                <div className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-lg font-medium">
                    {timeState.minutes.toString().padStart(2, '0')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleMinuteChange(-1)}
                  disabled={disabled}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed hover:bg-gray-100 rounded"
                  aria-label="Decrease minute"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* AM/PM Toggle */}
              {format12Hour && (
                <div className="flex flex-col items-center ml-2">
                  <button
                    type="button"
                    onClick={handlePeriodChange}
                    disabled={disabled}
                    className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {timeState.period}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Time Options */}
            <div className="border-t pt-3">
              <div className="text-sm text-gray-600 mb-2">Quick times</div>
              <div className="grid grid-cols-4 gap-2">
                {['9:00 AM', '12:00 PM', '6:00 PM', '9:00 PM'].map((time) => {
                  const parsed = parseTimeString(time, true);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        if (parsed) {
                          setTimeState(parsed);
                          const formattedTime = formatTime(parsed, format12Hour);
                          setInputValue(formattedTime);
                          onChange?.(formattedTime);
                        }
                      }}
                      disabled={disabled}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
