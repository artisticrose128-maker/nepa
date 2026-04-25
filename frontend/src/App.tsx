import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TimePicker from './components/TimePicker';
import PaymentIntegration from './components/PaymentIntegration';
import DataTable from './components/DataTable';
import { Home, Zap, CreditCard, History, Settings, Clock, Table } from 'lucide-react';

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
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">NEPA Dashboard</h2>
              <p className="text-gray-600 mb-6">Welcome to the NEPA payment system. Here's an overview of your account.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Payments</p>
                      <p className="text-2xl font-bold text-blue-900">₦25,000</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Successful</p>
                      <p className="text-2xl font-bold text-green-900">12</p>
                    </div>
                    <History className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900">3</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Failed</p>
                      <p className="text-2xl font-bold text-red-900">1</p>
                    </div>
                    <Settings className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
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
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Make a Payment</h2>
              <PaymentIntegration />
            </div>
          </div>
        );

      case 'payment-history':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment History</h2>
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
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Tables Demo</h2>
              <p className="text-gray-600 mb-6">
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
    </div>
  );
};

export default App;
