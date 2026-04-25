import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { PerformanceMonitorComponent } from '../components/PerformanceMonitor';
import { useTranslation } from '../i18n/useTranslation';

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <section aria-labelledby="analytics-heading">
        <h2 id="analytics-heading" className="text-3xl font-semibold text-foreground">{t('analytics.title')}</h2>
        <p className="text-muted-foreground text-lg">{t('analytics.description')}</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="space-y-6">
          <AnalyticsDashboard />
        </div>
        <div className="space-y-6">
          <PerformanceMonitorComponent enabled showDetails />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
