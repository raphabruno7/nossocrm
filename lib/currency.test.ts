import { describe, expect, it } from 'vitest';
import { currencySymbol, formatCurrency, formatCurrencyCompact } from './currency';

describe('currency', () => {
  it('formats BRL with R$', () => {
    expect(formatCurrency(1234.56, 'BRL')).toContain('R$');
  });

  it('formats EUR with €', () => {
    expect(formatCurrency(1234.56, 'EUR')).toContain('€');
  });

  it('formats compact with currency symbol', () => {
    expect(formatCurrencyCompact(1_000_000, 'BRL')).toContain('R$');
    expect(formatCurrencyCompact(1_000_000, 'EUR')).toContain('€');
  });

  it('returns currency symbols', () => {
    expect(currencySymbol('BRL')).toBe('R$');
    expect(currencySymbol('EUR')).toBe('€');
  });
});

