import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationDemo: React.FC = () => {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    addNotification,
    clearAllNotifications,
    notifications,
    unreadCount
  } = useNotifications();

  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const handleShowSuccess = () => {
    showSuccess(
      'Operation Successful!',
      'Your changes have been saved successfully.',
      { duration: 5000 }
    );
  };

  const handleShowError = () => {
    showError(
      'Error Occurred',
      'Failed to save your changes. Please try again.',
      { duration: 0 } // Persistent
    );
  };

  const handleShowWarning = () => {
    showWarning(
      'Warning',
      'Your session will expire in 5 minutes.',
      { 
        duration: 8000,
        actions: [
          {
            label: 'Extend Session',
            action: () => console.log('Session extended'),
            variant: 'primary'
          },
          {
            label: 'Dismiss',
            action: () => console.log('Warning dismissed'),
            variant: 'secondary'
          }
        ]
      }
    );
  };

  const handleShowInfo = () => {
    showInfo(
      'New Feature Available',
      'Check out our new dashboard analytics feature.',
      { 
        duration: 6000,
        actions: [
          {
            label: 'Learn More',
            action: () => console.log('Learn more clicked'),
            variant: 'primary'
          }
        ]
      }
    );
  };

  const handleShowCustom = () => {
    if (!customTitle.trim()) {
      showError('Validation Error', 'Please enter a title for the notification.');
      return;
    }

    addNotification({
      type: 'info',
      title: customTitle,
      message: customMessage || undefined,
      duration: 5000
    });

    // Clear form
    setCustomTitle('');
    setCustomMessage('');
  };

  const handleShowMultiple = () => {
    // Show multiple notifications in sequence
    setTimeout(() => showInfo('First', 'This is the first notification'), 0);
    setTimeout(() => showSuccess('Second', 'This is the second notification'), 500);
    setTimeout(() => showWarning('Third', 'This is the third notification'), 1000);
    setTimeout(() => showError('Fourth', 'This is the fourth notification'), 1500);
  };

  const handleShowPersistent = () => {
    showError(
      'Persistent Error',
      'This notification will not auto-dismiss. You must close it manually.',
      { duration: 0 }
    );
  };

  return (
    <div className="space-y-8">
      {/* Basic Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleShowSuccess}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Success
          </button>
          
          <button
            onClick={handleShowError}
            className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Error
          </button>
          
          <button
            onClick={handleShowWarning}
            className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Warning
          </button>
          
          <button
            onClick={handleShowInfo}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Info className="w-4 h-4 mr-2" />
            Info
          </button>
        </div>
      </div>

      {/* Advanced Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleShowMultiple}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Show Multiple
          </button>
          
          <button
            onClick={handleShowPersistent}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Persistent Notification
          </button>
          
          <button
            onClick={clearAllNotifications}
            className="flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </button>
        </div>
      </div>

      {/* Custom Notification */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Notification</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Notification title..."
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Optional message..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleShowCustom}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show Custom
          </button>
        </div>
      </div>

      {/* Status Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Active Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread Count</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
          
          {notifications.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Recent Notifications:</p>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="text-sm text-gray-700 bg-white rounded p-2">
                    <span className="font-medium">{notification.type}:</span> {notification.title}
                    {notification.message && <span className="text-gray-500"> - {notification.message}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accessibility Features */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility Features</h3>
        <div className="bg-blue-50 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Screen reader support with proper ARIA labels</li>
            <li>• Keyboard navigation for all interactive elements</li>
            <li>• High contrast colors for better visibility</li>
            <li>• Focus management and visual focus indicators</li>
            <li>• Semantic HTML structure for assistive technologies</li>
            <li>• Live regions for dynamic content announcements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
