import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { trackEvent } from '../services/analyticsService';
import { useGlobalState } from '../contexts/GlobalStateContext';

export const LanguageSwitcher: React.FC = () => {
  const { state, setLanguage } = useGlobalState();
  const { t } = useTranslation();

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{t('language.label')}:</span>
      <select
        value={state.language}
        onChange={(event) => {
          const next = event.target.value;
          setLanguage(next);
          trackEvent({
            page: window.location.pathname,
            type: 'event',
            category: 'preferences',
            action: 'language_change',
            label: next,
          });
        }}
        aria-label={t('language.label')}
        className="rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="en">{t('language.english')}</option>
        <option value="es">{t('language.spanish')}</option>
      </select>
    </label>
  );
};
