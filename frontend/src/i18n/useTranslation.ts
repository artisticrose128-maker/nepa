import { useMemo } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { translations, Language } from './translations';

const localeMap: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
};

const currencyMap: Record<string, string> = {
  NGN: 'NGN',
  USD: 'USD',
  EUR: 'EUR',
};

const timezoneMap: Record<string, string> = {
  'Africa/Lagos': 'Africa/Lagos',
  'America/New_York': 'America/New_York',
  'Europe/Madrid': 'Europe/Madrid',
};

const getNestedTranslation = (dictionary: any, key: string): string => {
  return key.split('.').reduce((obj, part) => obj?.[part], dictionary) ?? key;
};

export const useTranslation = () => {
  const { state } = useGlobalState();
  const language = state.language as Language;
  const locale = localeMap[language] || 'en-US';
  const currency = currencyMap[state.currency] || state.currency || 'USD';
  const timezone = timezoneMap[state.timezone] || 'UTC';

  return useMemo(() => ({
    language,
    locale,
    currency,
    timezone,
    t: (key: string) => getNestedTranslation(translations[language], key),
    formatDate: (value: Date | string, options?: Intl.DateTimeFormatOptions) => {
      const date = typeof value === 'string' ? new Date(value) : value;
      return new Intl.DateTimeFormat(locale, { timeZone: timezone, ...options }).format(date);
    },
    formatTime: (value: Date | string, options?: Intl.DateTimeFormatOptions) => {
      const date = typeof value === 'string' ? new Date(value) : value;
      return new Intl.DateTimeFormat(locale, { timeZone: timezone, hour: 'numeric', minute: 'numeric', second: 'numeric', ...options }).format(date);
    },
    formatCurrency: (amount: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    },
  }), [currency, language, locale, timezone, state.currency, state.timezone]);
};
