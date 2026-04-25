/**
 * SEO Monitoring and Analytics Utilities
 * Tracks page performance, user engagement, and SEO metrics
 */

interface SEOEvent {
  type: 'page_view' | 'scroll_depth' | 'dwell_time' | 'click' | 'form_submit';
  page: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface SEOAnalytics {
  pageViews: Map<string, number>;
  averageDwellTime: Map<string, number>;
  bounceRate: number;
  scrollDepth: Map<string, number>;
  conversionEvents: SEOEvent[];
}

class SEOMonitor {
  private static instance: SEOMonitor;
  private analytics: SEOAnalytics;
  private startTime: number;
  private currentPage: string;
  private scrollThresholds: number[] = [25, 50, 75, 90];
  private trackedScrollDepths: Set<number> = new Set();

  private constructor() {
    this.analytics = {
      pageViews: new Map(),
      averageDwellTime: new Map(),
      bounceRate: 0,
      scrollDepth: new Map(),
      conversionEvents: []
    };
    this.startTime = Date.now();
    this.currentPage = '';
    this.initializeEventListeners();
  }

  static getInstance(): SEOMonitor {
    if (!SEOMonitor.instance) {
      SEOMonitor.instance = new SEOMonitor();
    }
    return SEOMonitor.instance;
  }

  private initializeEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageExit();
      } else {
        this.trackPageEntry();
      }
    });

    // Track scroll depth
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScrollDepth();
      }, 100);
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackConversion('form_submit', {
        formId: form.id,
        formAction: form.action
      });
    });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.matches('button, a, [role="button"]')) {
        this.trackConversion('click', {
          element: target.tagName,
          text: target.textContent?.slice(0, 50),
          href: (target as HTMLAnchorElement).href
        });
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageExit();
      this.sendAnalyticsToServer();
    });
  }

  trackPageView(page: string): void {
    this.currentPage = page;
    this.startTime = Date.now();
    this.trackedScrollDepths.clear();

    const currentViews = this.analytics.pageViews.get(page) || 0;
    this.analytics.pageViews.set(page, currentViews + 1);

    // Send page view to analytics service
    this.sendEvent({
      type: 'page_view',
      page,
      timestamp: Date.now()
    });

    // Update page title for SEO
    this.updatePageTitle(page);
  }

  private updatePageTitle(page: string): void {
    const titles: Record<string, string> = {
      '/': 'NEPA - National Electricity Payment Assistant | Pay Electricity Bills Online',
      '/dashboard': 'Dashboard - NEPA | Manage Your Electricity Bills',
      '/payments': 'Make Payment - NEPA | Pay Electricity Bills Online',
      '/bills': 'My Bills - NEPA | View Electricity Bill History',
      '/profile': 'My Profile - NEPA | Account Settings',
      '/help': 'Help Center - NEPA | Support & FAQs',
      '/login': 'Login - NEPA | Access Your Account',
      '/register': 'Register - NEPA | Create Your Account'
    };

    if (titles[page]) {
      document.title = titles[page];
    }
  }

  private trackScrollDepth(): void {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.scrollY;
    const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

    this.scrollThresholds.forEach(threshold => {
      if (scrollPercentage >= threshold && !this.trackedScrollDepths.has(threshold)) {
        this.trackedScrollDepths.add(threshold);
        
        const currentDepth = this.analytics.scrollDepth.get(this.currentPage) || 0;
        this.analytics.scrollDepth.set(this.currentPage, Math.max(currentDepth, threshold));

        this.sendEvent({
          type: 'scroll_depth',
          page: this.currentPage,
          timestamp: Date.now(),
          metadata: { depth: threshold }
        });
      }
    });
  }

  private trackPageEntry(): void {
    this.startTime = Date.now();
  }

  private trackPageExit(): void {
    if (this.currentPage) {
      const dwellTime = Date.now() - this.startTime;
      
      const currentDwellTime = this.analytics.averageDwellTime.get(this.currentPage) || 0;
      const currentViews = this.analytics.pageViews.get(this.currentPage) || 1;
      const newAverageDwellTime = (currentDwellTime * (currentViews - 1) + dwellTime) / currentViews;
      
      this.analytics.averageDwellTime.set(this.currentPage, newAverageDwellTime);

      this.sendEvent({
        type: 'dwell_time',
        page: this.currentPage,
        timestamp: Date.now(),
        metadata: { dwellTime }
      });
    }
  }

  private trackConversion(type: 'click' | 'form_submit', metadata: Record<string, any>): void {
    const event: SEOEvent = {
      type,
      page: this.currentPage,
      timestamp: Date.now(),
      metadata
    };

    this.analytics.conversionEvents.push(event);
    this.sendEvent(event);
  }

  private sendEvent(event: SEOEvent): void {
    // Send to analytics service (Google Analytics, custom endpoint, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', event.type, {
        page_path: event.page,
        custom_parameter: JSON.stringify(event.metadata)
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(event);
  }

  private sendToCustomAnalytics(event: SEOEvent): void {
    // Send to your analytics API
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    }).catch(error => {
      console.warn('Failed to send analytics event:', error);
    });
  }

  private async sendAnalyticsToServer(): Promise<void> {
    try {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageViews: Object.fromEntries(this.analytics.pageViews),
          averageDwellTime: Object.fromEntries(this.analytics.averageDwellTime),
          scrollDepth: Object.fromEntries(this.analytics.scrollDepth),
          conversionEvents: this.analytics.conversionEvents.slice(-10) // Last 10 events
        })
      });
    } catch (error) {
      console.warn('Failed to send batch analytics:', error);
    }
  }

  // Public methods for accessing analytics data
  getAnalytics(): SEOAnalytics {
    return { ...this.analytics };
  }

  getPageViews(page?: string): number | Map<string, number> {
    if (page) {
      return this.analytics.pageViews.get(page) || 0;
    }
    return this.analytics.pageViews;
  }

  getAverageDwellTime(page?: string): number | Map<string, number> {
    if (page) {
      return this.analytics.averageDwellTime.get(page) || 0;
    }
    return this.analytics.averageDwellTime;
  }

  getScrollDepth(page?: string): number | Map<string, number> {
    if (page) {
      return this.analytics.scrollDepth.get(page) || 0;
    }
    return this.analytics.scrollDepth;
  }

  // SEO optimization suggestions
  getSEOSuggestions(): string[] {
    const suggestions: string[] = [];
    
    this.analytics.pageViews.forEach((views, page) => {
      const dwellTime = this.analytics.averageDwellTime.get(page) || 0;
      const scrollDepth = this.analytics.scrollDepth.get(page) || 0;
      
      if (dwellTime < 5000) {
        suggestions.push(`Page ${page} has low dwell time (${Math.round(dwellTime/1000)}s). Consider improving content engagement.`);
      }
      
      if (scrollDepth < 50) {
        suggestions.push(`Page ${page} has low scroll depth (${scrollDepth}%). Content above the fold may need improvement.`);
      }
      
      if (views < 10) {
        suggestions.push(`Page ${page} has low views (${views}). Consider improving SEO and internal linking.`);
      }
    });
    
    return suggestions;
  }
}

// Export singleton instance
export const seoMonitor = SEOMonitor.getInstance();

// React hook for using SEO monitoring
export const useSEOMonitor = () => {
  const trackPageView = (page: string) => {
    seoMonitor.trackPageView(page);
  };

  const getAnalytics = () => {
    return seoMonitor.getAnalytics();
  };

  const getSEOSuggestions = () => {
    return seoMonitor.getSEOSuggestions();
  };

  return {
    trackPageView,
    getAnalytics,
    getSEOSuggestions,
    getPageViews: seoMonitor.getPageViews.bind(seoMonitor),
    getAverageDwellTime: seoMonitor.getAverageDwellTime.bind(seoMonitor),
    getScrollDepth: seoMonitor.getScrollDepth.bind(seoMonitor)
  };
};
