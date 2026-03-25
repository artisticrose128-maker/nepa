import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

const analyticsService = new AnalyticsService();

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, days = '30' } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const daysNum = parseInt(days as string);

    const [stats, revenueChart, userGrowth, paymentTrends, userMetrics, prediction, utilityBreakdown, hourlyPatterns] = await Promise.all([
      analyticsService.getBillingStats(start, end),
      analyticsService.getDailyRevenue(daysNum, start, end),
      analyticsService.getUserGrowth(daysNum),
      analyticsService.getPaymentTrends(daysNum),
      analyticsService.getUserMetrics(daysNum),
      analyticsService.predictRevenue(daysNum),
      analyticsService.getUtilityTypeBreakdown(start, end),
      analyticsService.getHourlyPaymentPatterns(Math.min(daysNum, 7))
    ]);

    res.json({
      summary: stats,
      charts: {
        revenue: revenueChart,
        userGrowth,
        paymentTrends,
        utilityBreakdown,
        hourlyPatterns
      },
      userMetrics,
      prediction,
      dateRange: {
        startDate: start || new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000),
        endDate: end || new Date()
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const getRealTimeMetrics = async (req: Request, res: Response) => {
  try {
    const [stats, todayRevenue] = await Promise.all([
      analyticsService.getBillingStats(),
      analyticsService.getDailyRevenue(1)
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      ...stats,
      todayRevenue: todayRevenue.reduce((sum, day) => sum + day.value, 0),
      activeUsers: await analyticsService.getUserMetrics(1).then(m => m.activeUsers)
    });
  } catch (error) {
    console.error('Real-time metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch real-time metrics' });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { title, type, userId, startDate, endDate } = req.body;
    
    let data;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    switch (type) {
      case 'REVENUE':
        data = await analyticsService.getDailyRevenue(30, start, end);
        break;
      case 'USER_GROWTH':
        data = await analyticsService.getUserGrowth(30);
        break;
      case 'PAYMENT_TRENDS':
        data = await analyticsService.getPaymentTrends(30);
        break;
      case 'UTILITY_BREAKDOWN':
        data = await analyticsService.getUtilityTypeBreakdown(start, end);
        break;
      case 'USER_METRICS':
        data = await analyticsService.getUserMetrics(30);
        break;
      default:
        data = await analyticsService.getBillingStats(start, end);
    }

    const report = await analyticsService.saveReport(userId, title, type, { data, startDate: start, endDate: end });
    res.status(201).json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const exportData = async (req: Request, res: Response) => {
  try {
    const { type = 'revenue', startDate, endDate, days = '30' } = req.query;
    
    let csv: string;
    let filename: string;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const daysNum = parseInt(days as string);

    switch (type) {
      case 'revenue':
        const revenueData = await analyticsService.getDailyRevenue(daysNum, start, end);
        csv = 'Date,Revenue\n' + revenueData.map(row => `${row.date},${row.value}`).join('\n');
        filename = `revenue-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'user_growth':
        const userData = await analyticsService.getUserGrowth(daysNum);
        csv = 'Date,New Users\n' + userData.map(row => `${row.date},${row.count}`).join('\n');
        filename = `user-growth-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'utility_breakdown':
        const utilityData = await analyticsService.getUtilityTypeBreakdown(start, end);
        csv = 'Utility Type,Count,Total Amount,Average Amount,Late Fees\n' + 
          utilityData.map(row => `${row.utilityType},${row.count},${row.totalAmount},${row.averageAmount},${row.totalLateFees}`).join('\n');
        filename = `utility-breakdown-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        throw new Error('Invalid export type');
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
};

export const getPredictions = async (req: Request, res: Response) => {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string);
    
    const prediction = await analyticsService.predictRevenue(daysNum);
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
};