import type { CurrencyCode } from '@/types';

function normalizeCurrencyCode(input: CurrencyCode | string | null | undefined): CurrencyCode {
  if (input === 'EUR') return 'EUR';
  return 'BRL';
}

function localeForCurrency(currencyCode: CurrencyCode): string {
  switch (currencyCode) {
    case 'EUR':
      return 'pt-PT';
    case 'BRL':
    default:
      return 'pt-BR';
  }
}

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currencyCode: CurrencyCode, opts?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const locale = localeForCurrency(currencyCode);
  const key = JSON.stringify({ locale, currencyCode, opts: opts ?? {} });
  const cached = formatters.get(key);
  if (cached) return cached;

  const fmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
    ...opts,
  });
  formatters.set(key, fmt);
  return fmt;
}

export function formatCurrency(
  value: number,
  currencyCodeInput?: CurrencyCode | string | null,
  opts?: Intl.NumberFormatOptions
): string {
  const currencyCode = normalizeCurrencyCode(currencyCodeInput);
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return getFormatter(currencyCode, opts).format(safe);
  } catch {
    const prefix = currencyCode === 'EUR' ? '€' : 'R$';
    return `${prefix} ${safe.toFixed(2)}`;
  }
}

export function formatCurrencyCompact(
  value: number,
  currencyCodeInput?: CurrencyCode | string | null,
  opts?: Intl.NumberFormatOptions
): string {
  return formatCurrency(value, currencyCodeInput, {
    notation: 'compact',
    maximumFractionDigits: 1,
    ...opts,
  });
}

export function currencySymbol(currencyCodeInput?: CurrencyCode | string | null): string {
  return normalizeCurrencyCode(currencyCodeInput) === 'EUR' ? '€' : 'R$';
}

