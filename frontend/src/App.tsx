import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TimePicker from './components/TimePicker';
import PaymentIntegration from './components/PaymentIntegration';
import DataTable from './components/DataTable';
import { LoadingProvider } from './contexts/LoadingContext';
import { LoadingButton } from './components/LoadingButton';
import { LoadingCard, LoadingGrid } from './components/LoadingCard';
import { ProgressBar } from './components/ProgressBar';
import { Home, Zap, CreditCard, History, Settings, Clock, Table } from 'lucide-react';
import { AdvancedFileUpload } from './components/AdvancedFileUpload';
import { ToastContainer } from './components/ToastContainer';
import { NotificationDemo } from './components/NotificationDemo';
import { AdvancedSearch } from './components/AdvancedSearch';
import { SearchResults } from './components/SearchResults';
import { SearchAnalytics } from './components/SearchAnalytics';
import { FilterPanel } from './components/FilterPanel';
import { FilterBar } from './components/FilterBar';
import { FilterAnalytics } from './components/FilterAnalytics';
import { FilterDemo } from './components/FilterDemo';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';
import { FilterProvider } from './contexts/FilterContext';
import { Home, Zap, CreditCard, History, Settings, Clock, Table, Upload, Bell, Search, Filter } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  badge?: string | number;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sample data for DataTable demonstration
  const sampleData = [
    { id: 1, customer: 'John Doe', meterNumber: 'METER-001', amount: '5000', status: 'SUCCESS', date: '2024-01-15', time: '14:30' },
    { id: 2, customer: 'Jane Smith', meterNumber: 'METER-002', amount: '3500', status: 'PENDING', date: '2024-01-14', time: '09:15' },
    { id: 3, customer: 'Bob Johnson', meterNumber: 'METER-003', amount: '7500', status: 'FAILED', date: '2024-01-13', time: '16:45' },
    { id: 4, customer: 'Alice Brown', meterNumber: 'METER-004', amount: '2000', status: 'SUCCESS', date: '2024-01-12', time: '11:20' },
    { id: 5, customer: 'Charlie Wilson', meterNumber: 'METER-005', amount: '8000', status: 'PROCESSING', date: '2024-01-11', time: '13:00' },
  ];

  const tableColumns = [
    { key: 'customer', label: 'Customer', sortable: true, filterable: true },
    { key: 'meterNumber', label: 'Meter Number', sortable: true, filterable: true },
    { key: 'amount', label: 'Amount (₦)', sortable: true, type: 'number' as const },
    { key: 'status', label: 'Status', sortable: true, type: 'custom' as const, render: (value: any) => {
      const colors = {
        SUCCESS: 'bg-green-100 text-green-800',
        PENDING: 'bg-yellow-100 text-yellow-800',
        FAILED: 'bg-red-100 text-red-800',
        PROCESSING: 'bg-blue-100 text-blue-800'
      };
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
          {value}
        </span>
      );
    }},
    { key: 'date', label: 'Date', sortable: true, type: 'date' as const },
    { key: 'time', label: 'Time', sortable: true },
  ];

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home size={20} />,
      path: '/dashboard'
    },
    {
      id: 'payments',
      label: 'Bill Payment',
      icon: <Zap size={20} />,
      path: '/payments',
      children: [
        {
          id: 'new-payment',
          label: 'New Payment',
          icon: <CreditCard size={16} />,
          path: '/payments/new'
        },
        {
          id: 'payment-history',
          label: 'Payment History',
          icon: <History size={16} />,
          path: '/payments/history'
        }
      ]
    },
    {
      id: 'data-tables',
      label: 'Data Tables',
      icon: <Table size={20} />,
      path: '/tables'
    },
    {
      id: 'time-picker',
      label: 'Time Picker Demo',
      icon: <Clock size={20} />,
      path: '/time-picker'
    },
    {
      id: 'file-upload',
      label: 'File Upload',
      icon: <Upload size={20} />,
      path: '/file-upload'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={20} />,
      path: '/notifications'
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search size={20} />,
      path: '/search'
    },
    {
      id: 'filtering',
      label: 'Filtering',
      icon: <Filter size={20} />,
      path: '/filtering'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings'
    }
  ];

  const handleSidebarItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      return;
    } else {
      setActiveView(item.id);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mobile-card">
              <h2 className="mobile-heading-1 text-2xl font-bold text-gray-900 mb-4">NEPA Dashboard</h2>
              <p className="mobile-body text-gray-600 mb-6">Welcome to the NEPA payment system. Here's an overview of your account.</p>
              
              <div className="mobile-dashboard-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="mobile-stat-card bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mobile-caption text-sm text-blue-600 font-medium">Total Payments</p>
                      <p className="mobile-payment-amount text-2xl font-bold text-blue-900">₦25,000</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="mobile-stat-card bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mobile-caption text-sm text-green-600 font-medium">Successful</p>
                      <p className="mobile-payment-amount text-2xl font-bold text-green-900">12</p>
                    </div>
                    <History className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="mobile-stat-card bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mobile-caption text-sm text-yellow-600 font-medium">Pending</p>
                      <p className="mobile-payment-amount text-2xl font-bold text-yellow-900">3</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                
                <div className="mobile-stat-card bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mobile-caption text-sm text-red-600 font-medium">Failed</p>
                      <p className="mobile-payment-amount text-2xl font-bold text-red-900">1</p>
                    </div>
                    <Settings className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mobile-card">
              <h3 className="mobile-heading-3 text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <DataTable
                data={sampleData.slice(0, 3)}
                columns={tableColumns}
                pagination={false}
                searchable={false}
              />
            </div>
          </div>
        );

      case 'new-payment':
      case 'payments':
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mobile-card">
              <h2 className="mobile-heading-1 text-2xl font-bold text-gray-900 mb-4">Make a Payment</h2>
              <PaymentIntegration />
            </div>
          </div>
        );

      case 'payment-history':
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mobile-card">
              <h2 className="mobile-heading-1 text-2xl font-bold text-gray-900 mb-4">Payment History</h2>
              <DataTable
                data={sampleData}
                columns={tableColumns}
                searchable={true}
                searchPlaceholder="Search payments..."
                pageSize={5}
              />
            </div>
          </div>
        );

      case 'data-tables':
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mobile-card">
              <h2 className="mobile-heading-1 text-2xl font-bold text-gray-900 mb-4">Data Tables Demo</h2>
              <p className="mobile-body text-gray-600 mb-6">
                Advanced data table with sorting, filtering, pagination, and search capabilities.
              </p>
              <DataTable
                data={sampleData}
                columns={tableColumns}
                searchable={true}
                searchPlaceholder="Search transactions..."
                pageSize={3}
                exportable={true}
                onExport={(format) => console.log(`Exporting as ${format}`)}
                actions={[
                  {
                    key: 'view',
                    label: 'View Details',
                    onClick: (row) => console.log('View:', row),
                    variant: 'primary'
                  },
                  {
                    key: 'edit',
                    label: 'Edit',
                    onClick: (row) => console.log('Edit:', row),
                  },
                  {
                    key: 'delete',
                    label: 'Delete',
                    onClick: (row) => console.log('Delete:', row),
                    variant: 'danger'
                  }
                ]}
              />
            </div>
          </div>
        );

      case 'time-picker':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Time Picker Demo</h2>
              <p className="text-gray-600 mb-6">
                Accessible time picker with keyboard navigation, localization support, and responsive design.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">12-Hour Format</h3>
                  <TimePicker
                    value="09:30 AM"
                    onChange={(time) => console.log('Time changed:', time)}
                    placeholder="Select time"
                    format12Hour={true}
                    locale="en-US"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">24-Hour Format</h3>
                  <TimePicker
                    value="14:30"
                    onChange={(time) => console.log('Time changed:', time)}
                    placeholder="Select time"
                    format12Hour={false}
                    locale="en-US"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">With 15-minute steps</h3>
                  <TimePicker
                    onChange={(time) => console.log('Time changed:', time)}
                    placeholder="Select time"
                    minuteStep={15}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Disabled</h3>
                  <TimePicker
                    value="10:00 AM"
                    onChange={(time) => console.log('Time changed:', time)}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'file-upload':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">File Upload</h2>
              <p className="text-gray-600 mb-6">
                Advanced file upload component with drag-and-drop, progress indicators, file validation, and error handling.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General File Upload</h3>
                  <AdvancedFileUpload
                    onUploadComplete={(files) => console.log('Upload completed:', files)}
                    onFileSelect={(files) => console.log('Files selected:', files)}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024} // 10MB
                    allowedExtensions={['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Images Only</h3>
                  <AdvancedFileUpload
                    onUploadComplete={(files) => console.log('Images uploaded:', files)}
                    maxFiles={3}
                    maxSize={5 * 1024 * 1024} // 5MB
                    allowedTypes={['image/jpeg', 'image/png', 'image/gif']}
                    allowedExtensions={['.jpg', '.jpeg', '.png', '.gif']}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Upload Mode</h3>
                  <AdvancedFileUpload
                    onUploadComplete={(files) => console.log('Manual upload completed:', files)}
                    autoUpload={false}
                    maxFiles={10}
                    maxSize={20 * 1024 * 1024} // 20MB
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Notification System</h2>
              <p className="text-gray-600 mb-6">
                Comprehensive toast notification system with multiple types, positions, and accessibility features.
              </p>
              
              <NotificationDemo />
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Search System</h2>
              <p className="text-gray-600 mb-6">
                Advanced search functionality with suggestions, filters, history, and analytics.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Search Interface</h3>
                  <AdvancedSearch
                    onSearch={(query, filters) => console.log('Search:', query, filters)}
                    suggestions={[
                      { id: '1', text: 'meter readings', type: 'meter' },
                      { id: '2', text: 'payment history', type: 'payment' },
                      { id: '3', text: 'user accounts', type: 'user' },
                      { id: '4', text: 'transaction details', type: 'payment' }
                    ]}
                    filters={[
                      { id: 'type', label: 'Type', field: 'type', type: 'select', options: [
                        { value: 'meter', label: 'Meters' },
                        { value: 'payment', label: 'Payments' },
                        { value: 'user', label: 'Users' }
                      ]},
                      { id: 'dateRange', label: 'Date Range', field: 'date', type: 'date' },
                      { id: 'amount', label: 'Amount Range', field: 'amount', type: 'range', min: 0, max: 10000 }
                    ]}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Search Results</h3>
                  <SearchResults />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Search Analytics</h3>
                  <SearchAnalytics />
                </div>
              </div>
            </div>
          </div>
        );

      case 'filtering':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Filtering System</h2>
              <p className="text-gray-600 mb-6">
                Comprehensive filtering system with persistence, combinations, presets, and analytics.
              </p>
              
              <FilterDemo />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-600 mb-6">Manage your account settings and preferences.</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span>Email notifications for payments</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span>SMS notifications for failed payments</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span>Push notifications</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Payment Method
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Stellar Wallet</option>
                        <option>Credit Card</option>
                        <option>Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-gray-600">The requested page could not be found.</p>
          </div>
        );
    }
  };

  return (
    <LoadingProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar 
          items={sidebarItems}
    <div className="min-h-screen bg-gray-50 mobile-safe-area">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeItem={activeView}
          onItemClick={handleSidebarItemClick}
          open={sidebarOpen}
          onToggle={setSidebarOpen}
          collapsed={sidebarCollapsed}
          onCollapseToggle={setSidebarCollapsed}
        />
        
        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} ${sidebarCollapsed ? 'ml-16' : ''}`}>
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">NEPA Payment System</h1>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
              >
                <Table className="w-5 h-5" />
              </button>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } ml-0`}>
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm mobile-safe-area">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mobile-touch-target p-2 rounded-lg hover:bg-gray-100 mobile-focus-visible"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-blue-600 mobile-heading-2">NEPA 💡</h1>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Page Content */}
          <main className="p-4 lg:p-6 mobile-container">
            {renderContent()}
          </main>
        </div>
      </div>
    </LoadingProvider>
    </div>
    <FilterProvider>
      <SearchProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <div className="flex">
              {/* Sidebar */}
              <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                activeItem={activeView}
                onItemClick={handleSidebarItemClick}
                collapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
              />

              {/* Main Content */}
              <div className={`flex-1 transition-all duration-300 ${
                sidebarCollapsed ? 'ml-16' : 'ml-64'
              }`}>
                {/* Mobile Menu Toggle */}
                <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-xl font-bold text-blue-600">NEPA 💡</h1>
                </div>

                {/* Page Content */}
                <main className="p-6">
                  {renderContent()}
                </main>
              </div>
            </div>

            {/* Toast Container */}
            <ToastContainer position="top-right" maxVisible={5} />
          </div>
        </NotificationProvider>
      </SearchProvider>
    </FilterProvider>
  );
};

export default App;
