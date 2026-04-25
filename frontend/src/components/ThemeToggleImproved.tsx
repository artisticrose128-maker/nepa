import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import Dropdown, { DropdownItem } from './Dropdown';

interface ThemeToggleImprovedProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggleImproved: React.FC<ThemeToggleImprovedProps> = ({ 
  className = '', 
  showLabel = false,
  variant = 'default',
  size = 'md'
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions: DropdownItem[] = [
    {
      id: 'light',
      label: 'Light',
      value: 'light',
      icon: <Sun className="w-4 h-4" />,
      description: 'Light theme with bright colors'
    },
    {
      id: 'dark',
      label: 'Dark',
      value: 'dark',
      icon: <Moon className="w-4 h-4" />,
      description: 'Dark theme with reduced eye strain'
    },
    {
      id: 'system',
      label: 'System',
      value: 'system',
      icon: <Monitor className="w-4 h-4" />,
      description: `Follows system preference (${resolvedTheme})`,
      badge: resolvedTheme === 'dark' ? 'Dark' : 'Light'
    }
  ];

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return `System (${resolvedTheme})`;
      default:
        return 'Theme';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Dropdown
        items={themeOptions}
        value={theme}
        onSelect={(item) => setTheme(item.value as string)}
        placeholder="Select theme"
        variant={variant}
        size={size}
        searchable={false}
        showSelectedIcon={true}
        aria-label="Theme selector"
        className="min-w-[140px]"
      />
      
      {showLabel && (
        <span className="text-sm font-medium text-gray-600" aria-live="polite">
          {getThemeLabel()}
        </span>
      )}
    </div>
  );
};

export default ThemeToggleImproved;
