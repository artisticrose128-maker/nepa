import { ShareAnalytics } from '../components/SocialShare';

export interface SocialAnalyticsEvent {
  id: string;
  platform: string;
  action: 'share' | 'copy_link' | 'generate_image';
  contentType: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  userAgent: string;
  referrer: string;
  url: string;
  metadata?: {
    contentId?: string;
    contentType?: string;
    shareText?: string;
    imageUrl?: string;
    characterCount?: number;
  };
}

export interface SocialAnalyticsSummary {
  totalShares: number;
  sharesByPlatform: Record<string, number>;
  sharesByContentType: Record<string, number>;
  sharesByAction: Record<string, number>;
  topContent: Array<{
    contentId: string;
    contentType: string;
    shareCount: number;
  }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

class SocialAnalyticsService {
  private sessionId: string;
  private events: SocialAnalyticsEvent[] = [];
  private readonly STORAGE_KEY = 'nepa_social_analytics';
  private readonly MAX_EVENTS = 1000; // Limit stored events

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading analytics events:', error);
      this.events = [];
    }
  }

  private saveEvents(): void {
    try {
      // Keep only the most recent events
      const sortedEvents = this.events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const limitedEvents = sortedEvents.slice(0, this.MAX_EVENTS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedEvents));
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }

  // Track a social sharing event
  trackEvent(analytics: ShareAnalytics, userId?: string, metadata?: SocialAnalyticsEvent['metadata']): void {
    const event: SocialAnalyticsEvent = {
      id: this.generateEventId(),
      platform: analytics.platform,
      action: analytics.action,
      contentType: analytics.contentType,
      timestamp: analytics.timestamp,
      userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href,
      metadata,
    };

    this.events.push(event);
    this.saveEvents();

    // Send to server if available
    this.sendToServer(event);
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToServer(event: SocialAnalyticsEvent): Promise<void> {
    try {
      // Only send in production
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/analytics/social', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.error('Error sending analytics to server:', error);
    }
  }

  // Get analytics summary
  getSummary(days: number = 30): SocialAnalyticsSummary {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredEvents = this.events.filter(event => event.timestamp >= cutoffDate);

    const sharesByPlatform: Record<string, number> = {};
    const sharesByContentType: Record<string, number> = {};
    const sharesByAction: Record<string, number> = {};
    const contentShareCount: Record<string, number> = {};

    filteredEvents.forEach(event => {
      // Count by platform
      sharesByPlatform[event.platform] = (sharesByPlatform[event.platform] || 0) + 1;

      // Count by content type
      sharesByContentType[event.contentType] = (sharesByContentType[event.contentType] || 0) + 1;

      // Count by action
      sharesByAction[event.action] = (sharesByAction[event.action] || 0) + 1;

      // Count by content
      const contentId = event.metadata?.contentId || event.contentType;
      contentShareCount[contentId] = (contentShareCount[contentId] || 0) + 1;
    });

    // Get top content
    const topContent = Object.entries(contentShareCount)
      .map(([contentId, shareCount]) => ({
        contentId,
        contentType: this.getContentTypeFromId(contentId),
        shareCount,
      }))
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, 10);

    return {
      totalShares: filteredEvents.length,
      sharesByPlatform,
      sharesByContentType,
      sharesByAction,
      topContent,
      timeRange: {
        start: cutoffDate,
        end: new Date(),
      },
    };
  }

  private getContentTypeFromId(contentId: string): string {
    // Extract content type from content ID or metadata
    if (contentId.includes('payment')) return 'Payment Success';
    if (contentId.includes('achievement')) return 'Achievement';
    if (contentId.includes('savings')) return 'Savings Milestone';
    if (contentId.includes('eco')) return 'Eco Impact';
    return contentId;
  }

  // Get detailed events
  getEvents(limit: number = 100, offset: number = 0): SocialAnalyticsEvent[] {
    const sortedEvents = this.events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return sortedEvents.slice(offset, offset + limit);
  }

  // Get events by platform
  getEventsByPlatform(platform: string, limit: number = 50): SocialAnalyticsEvent[] {
    return this.events
      .filter(event => event.platform === platform)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get events by content type
  getEventsByContentType(contentType: string, limit: number = 50): SocialAnalyticsEvent[] {
    return this.events
      .filter(event => event.contentType === contentType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Export analytics data
  exportData(): string {
    const summary = this.getSummary();
    const events = this.getEvents();

    return JSON.stringify({
      summary,
      events,
      exportedAt: new Date().toISOString(),
      sessionId: this.sessionId,
    }, null, 2);
  }

  // Clear all analytics data
  clearData(): void {
    this.events = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get popular sharing times
  getPopularSharingTimes(): Array<{ hour: number; count: number }> {
    const hourCounts: Record<number, number> = {};

    this.events.forEach(event => {
      const hour = event.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);
  }

  // Get engagement metrics
  getEngagementMetrics(): {
    averageSharesPerSession: number;
    mostPopularPlatform: string;
    mostPopularContentType: string;
    totalSessions: number;
  } {
    const sessions = new Set(this.events.map(event => event.sessionId));
    const totalSessions = sessions.size;
    
    const sharesByPlatform = this.getSummary().sharesByPlatform;
    const mostPopularPlatform = Object.entries(sharesByPlatform)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    const sharesByContentType = this.getSummary().sharesByContentType;
    const mostPopularContentType = Object.entries(sharesByContentType)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    const averageSharesPerSession = totalSessions > 0 ? this.events.length / totalSessions : 0;

    return {
      averageSharesPerSession,
      mostPopularPlatform,
      mostPopularContentType,
      totalSessions,
    };
  }
}

// Create singleton instance
const socialAnalyticsService = new SocialAnalyticsService();

export default socialAnalyticsService;
