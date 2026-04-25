import React, { useState } from 'react';
import { User, Settings, LogOut, Mail, Bell, Shield, CreditCard } from 'lucide-react';
import Dropdown, { DropdownItem } from './Dropdown';
import ResponsiveDropdown from './ResponsiveDropdown';

const DropdownExample: React.FC = () => {
  const [selectedFruit, setSelectedFruit] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('light');

  const fruitOptions: DropdownItem[] = [
    { id: '1', label: 'Apple', value: 'apple', description: 'Fresh red apples' },
    { id: '2', label: 'Banana', value: 'banana', description: 'Yellow bananas', badge: 'Popular' },
    { id: '3', label: 'Orange', value: 'orange', description: 'Citrus oranges' },
    { id: '4', label: 'Grape', value: 'grape', description: 'Sweet grapes' },
    { id: '5', label: 'Strawberry', value: 'strawberry', description: 'Red strawberries', badge: 'New' },
  ];

  const userMenuItems: DropdownItem[] = [
    { 
      id: 'profile', 
      label: 'Profile', 
      value: 'profile',
      icon: <User className="w-4 h-4" />
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      value: 'settings',
      icon: <Settings className="w-4 h-4" />
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      value: 'notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: '3'
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      value: 'billing',
      icon: <CreditCard className="w-4 h-4" />
    },
    { 
      id: 'security', 
      label: 'Security', 
      value: 'security',
      icon: <Shield className="w-4 h-4" />
    },
    { 
      id: 'logout', 
      label: 'Logout', 
      value: 'logout',
      icon: <LogOut className="w-4 h-4" />
    },
  ];

  const themeOptions: DropdownItem[] = [
    { id: 'light', label: 'Light', value: 'light' },
    { id: 'dark', label: 'Dark', value: 'dark' },
    { id: 'system', label: 'System', value: 'system' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dropdown Components</h1>
      
      {/* Basic Dropdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Basic Dropdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a fruit
            </label>
            <Dropdown
              items={fruitOptions}
              value={selectedFruit}
              onSelect={(item) => setSelectedFruit(item.value as string)}
              placeholder="Choose a fruit"
              searchable
            />
            {selectedFruit && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFruit}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disabled dropdown
            </label>
            <Dropdown
              items={fruitOptions}
              onSelect={() => {}}
              placeholder="This is disabled"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Dropdown Variants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              variant="default"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outline
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              variant="outline"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghost
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              variant="ghost"
            />
          </div>
        </div>
      </div>

      {/* Dropdown Sizes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Small
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              size="sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medium
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              size="md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Large
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Dropdown Positions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bottom Left
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              position="bottom-left"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bottom Right
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              position="bottom-right"
            />
          </div>
        </div>
      </div>

      {/* User Menu Dropdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">User Menu with Icons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Actions
            </label>
            <Dropdown
              items={userMenuItems}
              value={selectedUser}
              onSelect={(item) => setSelectedUser(item.value as string)}
              placeholder="User menu"
              showSelectedIcon={false}
            />
            {selectedUser && (
              <p className="mt-2 text-sm text-gray-600">
                Selected action: {selectedUser}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Dropdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Responsive Dropdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile-Friendly Dropdown
            </label>
            <ResponsiveDropdown
              items={fruitOptions}
              value={selectedFruit}
              onSelect={(item) => setSelectedFruit(item.value as string)}
              placeholder="Choose a fruit (responsive)"
              searchable
              mobileModalTitle="Select Fruit"
            />
            <p className="mt-2 text-sm text-gray-500">
              Try this on mobile - it becomes a fullscreen modal!
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Advanced Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stay Open After Selection
            </label>
            <Dropdown
              items={themeOptions}
              value={selectedTheme}
              onSelect={(item) => setSelectedTheme(item.value as string)}
              closeOnSelect={false}
            />
            <p className="mt-2 text-sm text-gray-500">
              Menu stays open after selection
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Max Height
            </label>
            <Dropdown
              items={fruitOptions}
              value={selectedFruit}
              onSelect={(item) => setSelectedFruit(item.value as string)}
              maxHeight={150}
              searchable
            />
            <p className="mt-2 text-sm text-gray-500">
              Limited to 150px height
            </p>
          </div>
        </div>
      </div>

      {/* Accessibility Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Accessibility Features</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Keyboard Navigation</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Tab to focus the dropdown</li>
            <li>Enter or Space to open the menu</li>
            <li>Arrow keys to navigate options</li>
            <li>Enter or Space to select an option</li>
            <li>Escape to close the menu</li>
            <li>Tab to move to next element</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Screen Reader Support</h3>
          <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
            <li>Proper ARIA labels and roles</li>
            <li>Announces current selection</li>
            <li>Describes menu state (open/closed)</li>
            <li>Supports custom aria-labels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DropdownExample;
