import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface Payment {
  id: string;
  date: Date;
  amount: number;
  meterId: string;
  status: 'completed' | 'pending' | 'failed';
  type: string;
}

interface UsageData {
  date: string;
  consumption: number;
  cost: number;
}

interface BudgetData {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface UpcomingBill {
  id: string;
  dueDate: Date;
  amount: number;
  meterId: string;
  type: string;
}

const TabletOptimizedDashboard: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 641) {
        setScreenSize('mobile');
      } else if (width <= 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock data
  const payments: Payment[] = [
    { id: '1', date: subDays(new Date(), 2), amount: 45.50, meterId: 'METER-001', status: 'completed', type: 'Electricity' },
    { id: '2', date: subDays(new Date(), 5), amount: 38.20, meterId: 'METER-001', status: 'completed', type: 'Electricity' },
    { id: '3', date: subDays(new Date(), 8), amount: 52.75, meterId: 'METER-002', status: 'completed', type: 'Electricity' },
    { id: '4', date: subDays(new Date(), 12), amount: 41.30, meterId: 'METER-001', status: 'pending', type: 'Electricity' },
    { id: '5', date: subDays(new Date(), 15), amount: 48.90, meterId: 'METER-002', status: 'completed', type: 'Electricity' },
    { id: '6', date: subDays(new Date(), 18), amount: 35.60, meterId: 'METER-001', status: 'failed', type: 'Electricity' },
  ];

  const usageData: UsageData[] = [
    { date: 'Jan', consumption: 320, cost: 42.50 },
    { date: 'Feb', consumption: 280, cost: 37.20 },
    { date: 'Mar', consumption: 350, cost: 46.75 },
    { date: 'Apr', consumption: 290, cost: 38.30 },
    { date: 'May', consumption: 310, cost: 41.90 },
    { date: 'Jun', consumption: 340, cost: 45.60 },
  ];

  const budgetData: BudgetData[] = [
    { category: 'Electricity', allocated: 200, spent: 145.50, remaining: 54.50 },
    { category: 'Water', allocated: 80, spent: 62.30, remaining: 17.70 },
    { category: 'Gas', allocated: 120, spent: 98.75, remaining: 21.25 },
  ];

  const upcomingBills: UpcomingBill[] = [
    { id: '1', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), amount: 48.75, meterId: 'METER-001', type: 'Electricity' },
    { id: '2', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), amount: 35.20, meterId: 'METER-002', type: 'Electricity' },
    { id: '3', dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), amount: 28.50, meterId: 'METER-003', type: 'Water' },
  ];

  const consumptionTrendData = [
    { time: '00:00', consumption: 12 },
    { time: '04:00', consumption: 8 },
    { time: '08:00', consumption: 25 },
    { time: '12:00', consumption: 35 },
    { time: '16:00', consumption: 30 },
    { time: '20:00', consumption: 28 },
    { time: '23:00', consumption: 15 },
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = paymentFilter === 'all' || payment.status === paymentFilter;
    const matchesSearch = searchTerm === '' ||
      payment.meterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const avgMonthlyBill = totalSpent / 6;
  const successRate = payments.length > 0 
    ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100)
    : 0;

  const COLORS = resolvedTheme === 'dark' 
    ? ['rgb(96, 165, 250)', 'rgb(74, 222, 128)', 'rgb(251, 191, 36)', 'rgb(248, 113, 113)']
    : ['rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)'];

  // Responsive grid classes based on screen size
  const getStatsGridClass = () => {
    if (screenSize === 'mobile') return 'grid grid-cols-1 gap-4';
    if (screenSize === 'tablet') return 'tablet-md-grid-2';
    return 'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6';
  };

  const getMainGridClass = () => {
    if (screenSize === 'mobile') return 'grid grid-cols-1 gap-6';
    if (screenSize === 'tablet') return 'tablet-md-grid-2';
    return 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6';
  };

  const getChartHeight = () => {
    if (screenSize === 'mobile') return 250;
    if (screenSize === 'tablet') return 300;
    return 350;
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            User Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor your utility payments and consumption
          </p>
        </div>

        {/* Stats Cards */}
        <div className={getStatsGridClass()}>
          <div className="bg-card rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 tablet-hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Spent</p>
                <p className="text-xl sm:text-2xl font-bold text-card-foreground">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-primary/10 rounded-full p-2 sm:p-3 ml-3">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 tablet-hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Avg Monthly Bill</p>
                <p className="text-xl sm:text-2xl font-bold text-card-foreground">${avgMonthlyBill.toFixed(2)}</p>
              </div>
              <div className="bg-success/10 rounded-full p-2 sm:p-3 ml-3">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 tablet-hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Success Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-card-foreground">{successRate}%</p>
              </div>
              <div className="bg-info/10 rounded-full p-2 sm:p-3 ml-3">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 tablet-hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Active Meters</p>
                <p className="text-xl sm:text-2xl font-bold text-card-foreground">3</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={getMainGridClass()}>
          {/* Usage Chart */}
          <div className={`${screenSize === 'tablet' ? 'tablet-card-featured' : 'lg:col-span-2'} bg-white rounded-lg shadow p-6`}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage & Cost</h2>
            <div className="tablet-chart-container" style={{ height: getChartHeight() }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="consumption" fill="#3b82f6" name="Consumption (kWh)" />
                  <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#10b981" name="Cost ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h2>
            <div className="tablet-chart-container" style={{ height: getChartHeight() }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="spent"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Charts Row */}
        <div className={screenSize === 'tablet' ? 'tablet-md-grid-2' : 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'}>
          {/* Consumption Trends */}
          <div className="bg-white rounded-lg shadow-sm sm:shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Daily Consumption Pattern
            </h2>
            <div className="tablet-chart-container" style={{ height: getChartHeight() - 50 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumptionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    className="text-xs sm:text-sm"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-xs sm:text-sm"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="bg-white rounded-lg shadow-sm sm:shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Upcoming Bills
            </h2>
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
              {upcomingBills.map((bill) => (
                <div 
                  key={bill.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{bill.type}</p>
                    <p className="text-sm text-gray-600">{bill.meterId}</p>
                    <p className="text-xs text-gray-500">
                      Due: {format(bill.dueDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${bill.amount.toFixed(2)}</p>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Recent Payments</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tablet-touch-input"
              />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tablet-touch-input"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="tablet-table-container">
            <div className="tablet-table-wrapper">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meter ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(payment.date, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.meterId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabletOptimizedDashboard;
