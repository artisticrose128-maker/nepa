import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { AnalyticsService } from '../services/AnalyticsService';

interface RealTimeMetrics {
  timestamp: string;
  totalRevenue: number;
  overdueBills: number;
  pendingBills: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  todayRevenue: number;
  activeUsers: number;
}

class RealTimeAnalyticsService {
  private io: SocketIOServer;
  private analyticsService: AnalyticsService;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    
    this.analyticsService = new AnalyticsService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected to real-time analytics:', socket.id);

      // Send initial metrics on connection
      this.sendRealTimeMetrics(socket);

      // Handle subscription to real-time updates
      socket.on('subscribe-analytics', () => {
        socket.join('analytics-updates');
        console.log('Client subscribed to analytics updates:', socket.id);
      });

      // Handle unsubscription
      socket.on('unsubscribe-analytics', () => {
        socket.leave('analytics-updates');
        console.log('Client unsubscribed from analytics updates:', socket.id);
      });

      // Handle custom date range requests
      socket.on('get-metrics-range', async (data: { startDate: string; endDate: string }) => {
        try {
          const start = new Date(data.startDate);
          const end = new Date(data.endDate);
          const metrics = await this.getCustomRangeMetrics(start, end);
          socket.emit('metrics-range-response', metrics);
        } catch (error) {
          socket.emit('analytics-error', { message: 'Failed to fetch custom range metrics' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected from real-time analytics:', socket.id);
      });
    });

    // Start broadcasting metrics every 30 seconds
    this.startMetricsBroadcast();
  }

  private async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const [stats, todayRevenue] = await Promise.all([
        this.analyticsService.getBillingStats(),
        this.analyticsService.getDailyRevenue(1)
      ]);

      const userMetrics = await this.analyticsService.getUserMetrics(1);

      return {
        timestamp: new Date().toISOString(),
        totalRevenue: stats.totalRevenue,
        overdueBills: stats.overdueBills,
        pendingBills: stats.pendingBills,
        successfulPayments: stats.successfulPayments,
        failedPayments: stats.failedPayments,
        successRate: stats.successRate,
        todayRevenue: todayRevenue.reduce((sum, day) => sum + day.value, 0),
        activeUsers: userMetrics.activeUsers
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }

  private async getCustomRangeMetrics(startDate: Date, endDate: Date) {
    const [stats, revenueData, userGrowth, paymentTrends] = await Promise.all([
      this.analyticsService.getBillingStats(startDate, endDate),
      this.analyticsService.getDailyRevenue(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), startDate, endDate),
      this.analyticsService.getUserGrowth(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
      this.analyticsService.getPaymentTrends(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    ]);

    return {
      summary: stats,
      charts: {
        revenue: revenueData,
        userGrowth,
        paymentTrends
      },
      dateRange: { startDate, endDate }
    };
  }

  private async sendRealTimeMetrics(socket?: any) {
    try {
      const metrics = await this.getRealTimeMetrics();
      
      if (socket) {
        socket.emit('real-time-metrics', metrics);
      } else {
        // Broadcast to all subscribed clients
        this.io.to('analytics-updates').emit('real-time-metrics', metrics);
      }
    } catch (error) {
      console.error('Error sending real-time metrics:', error);
      this.io.emit('analytics-error', { message: 'Failed to fetch real-time metrics' });
    }
  }

  private startMetricsBroadcast() {
    // Clear any existing interval
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Broadcast metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.sendRealTimeMetrics();
    }, 30000);

    console.log('Real-time analytics broadcast started (30-second intervals)');
  }

  public stopMetricsBroadcast() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
      console.log('Real-time analytics broadcast stopped');
    }
  }

  // Method to trigger immediate metrics update (e.g., after a payment is processed)
  public async triggerMetricsUpdate() {
    await this.sendRealTimeMetrics();
  }

  // Get current socket.io instance for external use
  public getIO() {
    return this.io;
  }
}

export default RealTimeAnalyticsService;
