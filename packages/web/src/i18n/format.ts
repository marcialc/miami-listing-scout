export type Locale = "en" | "es";

const LOCALE_MAP: Record<Locale, string> = {
  en: "en-US",
  es: "es-US",
};

export function formatCurrency(value: number, locale: Locale): string {
  return value.toLocaleString(LOCALE_MAP[locale], {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(LOCALE_MAP[locale]);
}

export function formatDate(date: Date | string, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE_MAP[locale], options);
}

export function formatTime(date: Date | string, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(LOCALE_MAP[locale], options);
}
