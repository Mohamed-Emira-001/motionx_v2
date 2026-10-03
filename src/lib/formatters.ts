import i18n from '../i18n/config';

export function getLocale(): string {
  return i18n.language === 'ar' ? 'ar-EG' : 'en-US';
}

export function formatDate(dateInput: string | Date | number, options?: Intl.DateTimeFormatOptions): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const locale = getLocale();
    return new Intl.DateTimeFormat(locale, options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function formatDateTime(dateInput: string | Date | number): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const locale = getLocale();
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function formatCurrency(amountCents: number, currency: string = 'USD'): string {
  try {
    const amount = amountCents / 100;
    const locale = getLocale();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}

export function formatNumber(num: number): string {
  try {
    const locale = getLocale();
    return new Intl.NumberFormat(locale).format(num);
  } catch {
    return String(num);
  }
}

export function formatPercent(num: number): string {
  try {
    const locale = getLocale();
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 0,
    }).format(num / 100);
  } catch {
    return `${num}%`;
  }
}
