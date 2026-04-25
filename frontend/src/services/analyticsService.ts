export interface AnalyticsEvent {
  id: string;
  type: 'pageview' | 'event' | 'performance';
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  page: string;
  timestamp: string;
  sessionId: string;
  userAgent: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  pageViews: number;
  customEvents: number;
  performanceEvents: number;
  eventsByCategory: Record<string, number>;
  topActions: Array<{ action: string; count: number }>;
}

const STORAGE_KEY = 'nepa_frontend_analytics';

const generateId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
const getSessionId = () => {
  const existing = sessionStorage.getItem('nepa_analytics_session');
  if (existing) return existing;
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  sessionStorage.setItem('nepa_analytics_session', sessionId);
  return sessionId;
};

const loadEvents = (): AnalyticsEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch (error) {
    console.error('Failed to load analytics events', error);
    return [];
  }
};

const saveEvents = (events: AnalyticsEvent[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-1000)));
  } catch (error) {
    console.error('Failed to save analytics events', error);
  }
};

export const trackEvent = (event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId' | 'userAgent'>) => {
  const sessionId = getSessionId();
  const analyticsEvent: AnalyticsEvent = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    sessionId,
    userAgent: navigator.userAgent,
    ...event,
  };
  const events = loadEvents();
  saveEvents([...events, analyticsEvent]);
  if (process.env.NODE_ENV === 'production') {
    void fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsEvent),
    }).catch(console.error);
  }
};

export const trackPageView = (page: string) => {
  trackEvent({
    page,
    type: 'pageview',
    category: 'navigation',
    action: 'page_view',
    label: page,
  });
};

export const getAnalyticsEvents = (): AnalyticsEvent[] => loadEvents();

export const getAnalyticsSummary = (): AnalyticsSummary => {
  const events = loadEvents();
  const summary = events.reduce<AnalyticsSummary>((acc, event) => {
    acc.totalEvents += 1;
    if (event.type === 'pageview') acc.pageViews += 1;
    if (event.type === 'event') acc.customEvents += 1;
    if (event.type === 'performance') acc.performanceEvents += 1;
    acc.eventsByCategory[event.category] = (acc.eventsByCategory[event.category] || 0) + 1;
    const existing = acc.topActions.find(item => item.action === event.action);
    if (existing) existing.count += 1;
    else acc.topActions.push({ action: event.action, count: 1 });
    return acc;
  }, {
    totalEvents: 0,
    pageViews: 0,
    customEvents: 0,
    performanceEvents: 0,
    eventsByCategory: {},
    topActions: [],
  });
  summary.topActions.sort((a, b) => b.count - a.count);
  return summary;
};

export const clearAnalyticsEvents = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear analytics events', error);
  }
};
