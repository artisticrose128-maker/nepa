import React, { useState } from 'react';

interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone: string;
  language: string;
  currency: string;
  theme: string;
  layout: string;
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ProfileCustomizationProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  currentTheme: string;
  resolvedTheme: 'light' | 'dark';
}

const themes = [
  { id: 'light', name: 'Light', description: 'Clean and bright interface' },
  { id: 'dark', name: 'Dark', description: 'Easy on the eyes in low light' },
  { id: 'system', name: 'System', description: 'Follows your system preference' }
];

const layoutOptions = [
  { id: 'compact', name: 'Compact', description: 'More content, less spacing' },
  { id: 'comfortable', name: 'Comfortable', description: 'Balanced spacing and content' },
  { id: 'spacious', name: 'Spacious', description: 'More room to breathe' }
];

const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' }
];

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
];

export const ProfileCustomization: React.FC<ProfileCustomizationProps> = ({
  profile,
  onUpdate,
  currentTheme,
  resolvedTheme
}) => {
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    timezone: profile.timezone,
    language: profile.language,
    currency: profile.currency,
    theme: profile.theme,
    layout: profile.preferences?.layout || 'comfortable',
    sidebarCollapsed: profile.preferences?.sidebarCollapsed || false,
    notificationsEnabled: profile.preferences?.notificationsEnabled !== false,
    autoSave: profile.preferences?.autoSave !== false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updates: Partial<UserProfile> = {
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      timezone: formData.timezone,
      language: formData.language,
      currency: formData.currency,
      theme: formData.theme,
      preferences: {
        layout: formData.layout,
        sidebarCollapsed: formData.sidebarCollapsed,
        notificationsEnabled: formData.notificationsEnabled,
        autoSave: formData.autoSave
      }
    };

    onUpdate(updates);
  };

  const handleReset = () => {
    setFormData({
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      timezone: profile.timezone,
      language: profile.language,
      currency: profile.currency,
      theme: profile.theme,
      layout: profile.preferences?.layout || 'comfortable',
      sidebarCollapsed: profile.preferences?.sidebarCollapsed || false,
      notificationsEnabled: profile.preferences?.notificationsEnabled !== false,
      autoSave: profile.preferences?.autoSave !== false
    });
  };

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Theme Preference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                formData.theme === themeOption.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={() => handleInputChange('theme', themeOption.id)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value={themeOption.id}
                  checked={formData.theme === themeOption.id}
                  onChange={() => handleInputChange('theme', themeOption.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <label className="font-medium text-gray-900 dark:text-gray-100">
                    {themeOption.name}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {themeOption.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Layout Preference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {layoutOptions.map((layout) => (
            <div
              key={layout.id}
              className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                formData.layout === layout.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={() => handleInputChange('layout', layout.id)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="layout"
                  value={layout.id}
                  checked={formData.layout === layout.id}
                  onChange={() => handleInputChange('layout', layout.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <label className="font-medium text-gray-900 dark:text-gray-100">
                    {layout.name}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {layout.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Personal Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="City, Country"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Regional Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Preferences
        </h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.sidebarCollapsed}
              onChange={(e) => handleInputChange('sidebarCollapsed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Collapse sidebar by default
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.notificationsEnabled}
              onChange={(e) => handleInputChange('notificationsEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enable notifications
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.autoSave}
              onChange={(e) => handleInputChange('autoSave', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Auto-save preferences
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
