import React, { useState, useEffect, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { EnhancedChart, ChartDataPoint } from './charts/EnhancedChart';
import { useTranslation } from '../i18n/useTranslation';
import { trackEvent, getAnalyticsSummary, AnalyticsSummary } from '../services/analyticsService';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    overdueBills: number;
    pendingBills: number;
    successfulPayments: number;
    failedPayments: number;
    successRate: number;
  };
  charts: {
    revenue: Array<{ date: string; value: number }>;
    userGrowth: Array<{ date: string; count: number }>;
    paymentTrends: Array<{
      date: string;
      total: number;
      successful: number;
      failed: number;
      byType: Record<string, number>;
    }>;
    utilityBreakdown: Array<{
      utilityType: string;
      count: number;
      totalAmount: number;
      totalLateFees: number;
      averageAmount: number;
    }>;
    hourlyPatterns: Array<{
      hour: number;
      count: number;
      totalAmount: number;
      avgAmount: number;
    }>;
  };
  userMetrics: {
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
    avgSpendingPerUser: number;
    userEngagementRate: number;
  };
  prediction: {
    predictedDailyRevenue: number;
    predictedWeeklyRevenue: number;
    predictedMonthlyRevenue: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    nextWeekPredictions: number[];
  };
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

const AnalyticsDashboard: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const { t, formatCurrency, formatDate } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'users' | 'payments'>('revenue');

  // Colors based on theme
  const COLORS = resolvedTheme === 'dark' 
    ? ['rgb(96, 165, 250)', 'rgb(74, 222, 128)', 'rgb(251, 191, 36)', 'rgb(248, 113, 113)', 'rgb(196, 181, 253)', 'rgb(251, 146, 60)']
    : ['rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)', 'rgb(139, 92, 246)', 'rgb(249, 115, 22)'];

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock comprehensive analytics data
        const mockData: AnalyticsData = {
          summary: {
            totalRevenue: 154780.50,
            overdueBills: 23,
            pendingBills: 45,
            successfulPayments: 1247,
            failedPayments: 23,
            successRate: 98.2
          },
          charts: {
            revenue: Array.from({ length: 30 }, (_, i) => ({
              date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
              value: Math.random() * 5000 + 3000
            })),
            userGrowth: Array.from({ length: 30 }, (_, i) => ({
              date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
              count: Math.floor(Math.random() * 20) + 5
            })),
            paymentTrends: Array.from({ length: 30 }, (_, i) => ({
              date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
              total: Math.random() * 6000 + 4000,
              successful: Math.random() * 5500 + 3500,
              failed: Math.random() * 500 + 100,
              byType: {
                'Electricity': Math.random() * 4000 + 2500,
                'Water': Math.random() * 1500 + 800,
                'Gas': Math.random() * 1000 + 500
              }
            })),
            utilityBreakdown: [
              { utilityType: 'Electricity', count: 856, totalAmount: 125000, totalLateFees: 2400, averageAmount: 146.50 },
              { utilityType: 'Water', count: 234, totalAmount: 28780, totalLateFees: 580, averageAmount: 123.00 },
              { utilityType: 'Gas', count: 156, totalAmount: 18765, totalLateFees: 320, averageAmount: 120.30 }
            ],
            hourlyPatterns: Array.from({ length: 24 }, (_, hour) => ({
              hour,
              count: Math.floor(Math.random() * 50) + 10,
              totalAmount: Math.random() * 2000 + 500,
              avgAmount: Math.random() * 100 + 30
            }))
          },
          userMetrics: {
            newUsers: 67,
            activeUsers: 892,
            totalUsers: 1247,
            avgSpendingPerUser: 124.15,
            userEngagementRate: 71.5
          },
          prediction: {
            predictedDailyRevenue: 5234.50,
            predictedWeeklyRevenue: 36641.50,
            predictedMonthlyRevenue: 157035.00,
            trend: 'UP',
            confidence: 'HIGH',
            nextWeekPredictions: [5120, 5340, 5180, 5420, 5290, 5380, 5450]
          }
        };
        
        setData(mockData);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);

  useEffect(() => {
    setAnalyticsSummary(getAnalyticsSummary());
  }, []);

  const handleDateRangeChange = (type: 'week' | 'month' | 'quarter' | 'year') => {
    trackEvent({
      page: '/analytics',
      type: 'event',
      category: 'analytics',
      action: 'date_range_change',
      label: type,
    });

    const endDate = new Date();
    let startDate: Date;

    switch (type) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subDays(endDate, 30);
        break;
      case 'quarter':
        startDate = subDays(endDate, 90);
        break;
      case 'year':
        startDate = subDays(endDate, 365);
        break;
    }

    setDateRange({ startDate, endDate });
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'png') => {
    if (!data) return;

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        const csvContent = [
          'Date,Revenue,New Users,Active Users',
          ...data.charts.revenue.map((item, index) => 
            `${item.date},${item.value.toFixed(2)},${data.charts.userGrowth[index]?.count || 0},${data.userMetrics.activeUsers}`
          )
        ].join('\n');
        
        content = csvContent;
        filename = `analytics-export-${new Date().toISOString().slice(0, 10)}.csv`;
        mimeType = 'text/csv';
      } else {
        // For PDF/PNG, a browser download placeholder is supported by event tracking.
        trackEvent({
          page: '/analytics',
          type: 'event',
          category: 'analytics',
          action: 'export_attempt',
          label: format,
        });
        return;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('analytics.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-destructive">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Comprehensive business insights and metrics</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            <select
              value={`${dateRange.startDate.toISOString()}-${dateRange.endDate.toISOString()}`}
              onChange={(e) => {
                const [start, end] = e.target.value.split('-');
                setDateRange({
                  startDate: new Date(start),
                  endDate: new Date(end)
                });
              }}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Custom Range</option>
            </select>
            
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range as any)}
                className="px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors capitalize"
              >
                {range}
              </button>
            ))}
            
            <div className="flex gap-1 border border-border rounded-md">
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-2 hover:bg-accent transition-colors"
                title="Export as CSV"
              >
                📊
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-2 hover:bg-accent transition-colors"
                title="Export as PDF"
              >
                📄
              </button>
              <button
                onClick={() => handleExport('png')}
                className="px-3 py-2 hover:bg-accent transition-colors"
                title="Export as PNG"
              >
                🖼️
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  ${data.summary.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.prediction.trend === 'UP' ? '📈' : data.prediction.trend === 'DOWN' ? '📉' : '➡️'} 
                  {' '}{data.prediction.trend}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.successRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.summary.successfulPayments} successful
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{data.userMetrics.activeUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.userMetrics.newUsers} new this period
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. User Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${data.userMetrics.avgSpendingPerUser}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.userMetrics.userEngagementRate}% engagement
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Insights */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Revenue Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Daily Prediction</p>
              <p className="text-xl font-bold text-foreground">
                ${data.prediction.predictedDailyRevenue}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Weekly Prediction</p>
              <p className="text-xl font-bold text-foreground">
                ${data.prediction.predictedWeeklyRevenue}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Monthly Prediction</p>
              <p className="text-xl font-bold text-foreground">
                ${data.prediction.predictedMonthlyRevenue}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              data.prediction.confidence === 'HIGH' ? 'bg-green-100 text-green-800' :
              data.prediction.confidence === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {data.prediction.confidence} Confidence
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              data.prediction.trend === 'UP' ? 'bg-green-100 text-green-800' :
              data.prediction.trend === 'DOWN' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {data.prediction.trend} Trend
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.charts.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value as string), 'MMM dd, yyyy')}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={COLORS[0]} 
                  fill={COLORS[0]}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Trends */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Payment Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data.charts.paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value as string), 'MMM dd, yyyy')}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'successful' ? t('analytics.successful') : name === 'failed' ? t('analytics.failed') : t('analytics.total')
                  ]}
                />
                <Legend />
                <Bar dataKey="successful" fill={COLORS[1]} name="Successful" />
                <Bar dataKey="failed" fill={COLORS[3]} name="Failed" />
                <Line type="monotone" dataKey="total" stroke={COLORS[0]} name="Total" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value as string), 'MMM dd, yyyy')}
                  formatter={(value: number) => [value.toLocaleString(), 'New Users']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={COLORS[2]} 
                  strokeWidth={2}
                  dot={{ fill: COLORS[2], r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Utility Type Breakdown */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Utility Type Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.charts.utilityBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ utilityType, totalAmount }) => `${utilityType}: $${totalAmount.toLocaleString()}`}
                  outerRadius={80}
                  fill={COLORS[0]}
                  dataKey="totalAmount"
                >
                  {data.charts.utilityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Payment Patterns */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Hourly Payment Patterns</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.hourlyPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'count' ? value.toLocaleString() : `$${value.toLocaleString()}`,
                  name === 'count' ? 'Transactions' : name === 'totalAmount' ? 'Total Amount' : 'Average Amount'
                ]}
              />
              <Legend />
              <Bar dataKey="count" fill={COLORS[4]} name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Utility Breakdown Table */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Utility Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Utility Type</th>
                    <th className="text-right py-2">Count</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-right py-2">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {data.charts.utilityBreakdown.map((utility) => (
                    <tr key={utility.utilityType} className="border-b border-border">
                      <td className="py-2">{utility.utilityType}</td>
                      <td className="text-right py-2">{utility.count}</td>
                      <td className="text-right py-2">${utility.totalAmount.toLocaleString()}</td>
                      <td className="text-right py-2">${utility.averageAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prediction Breakdown */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Next Week Predictions</h2>
            <div className="space-y-2">
              {data.prediction.nextWeekPredictions.map((prediction, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    {format(subDays(new Date(), 6 - index), 'EEEE')}
                  </span>
                  <span className="font-medium">
                    ${prediction.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
