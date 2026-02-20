import { describe, it, expect } from 'vitest';
import { normalizeDate, detectDateColumns, normalizeDateColumns } from '@/lib/dateNormalizer';

describe('normalizeDate', () => {
  it('parses ISO dates', () => {
    expect(normalizeDate('2026-01-15')).toEqual({ value: '2026-01-15', format: 'iso' });
  });

  it('parses BR dates dd/mm/yyyy', () => {
    expect(normalizeDate('15/01/2026')).toEqual({ value: '2026-01-15', format: 'br' });
  });

  it('parses BR dates with dash', () => {
    expect(normalizeDate('15-01-2026')).toEqual({ value: '2026-01-15', format: 'br_dash' });
  });

  it('parses BR short year dd/mm/yy', () => {
    expect(normalizeDate('15/01/26')).toEqual({ value: '2026-01-15', format: 'br_short' });
  });

  it('parses ISO datetime', () => {
    const r = normalizeDate('2026-03-20T14:30:00');
    expect(r.value).toBe('2026-03-20');
    expect(r.format).toBe('iso_datetime');
  });

  it('parses month/year BR (Fev/2026)', () => {
    expect(normalizeDate('Fev/2026')).toEqual({ value: '2026-02-01', format: 'month_year_br' });
  });

  it('parses month-year EN (Mar-2026)', () => {
    expect(normalizeDate('Mar-2026')).toEqual({ value: '2026-03-01', format: 'month_year_br' });
  });

  it('parses year-month (2026-01)', () => {
    expect(normalizeDate('2026-01')).toEqual({ value: '2026-01-01', format: 'year_month' });
  });

  it('parses Excel serial date (number)', () => {
    // 46037 = 2026-01-15 in Excel
    const r = normalizeDate(46037);
    expect(r.format).toBe('excel_serial');
    expect(r.value).toBe('2026-01-15');
  });

  it('parses Excel serial date (string)', () => {
    const r = normalizeDate('46037');
    expect(r.format).toBe('excel_serial');
    expect(r.value).toBe('2026-01-15');
  });

  it('handles Date objects', () => {
    const r = normalizeDate(new Date(2026, 0, 15));
    expect(r.value).toBe('2026-01-15');
  });

  it('returns null for empty/invalid', () => {
    expect(normalizeDate('')).toEqual({ value: null, format: 'unknown' });
    expect(normalizeDate(null)).toEqual({ value: null, format: 'unknown' });
    expect(normalizeDate('abc')).toEqual({ value: null, format: 'unknown' });
  });
});

describe('detectDateColumns', () => {
  it('identifies date columns from sample data', () => {
    const data = [
      { nome: 'A', data: '15/01/2026', valor: 100 },
      { nome: 'B', data: '20/02/2026', valor: 200 },
      { nome: 'C', data: '10/03/2026', valor: 300 },
    ];
    const cols = detectDateColumns(data, ['nome', 'data', 'valor']);
    expect(cols).toEqual(['data']);
  });
});

describe('normalizeDateColumns', () => {
  it('normalizes dates in-place and returns logs', () => {
    const data = [
      { data: '15/01/2026', valor: 100 },
      { data: 'Fev/2026', valor: 200 },
    ];
    const logs = normalizeDateColumns(data as any, ['data']);
    expect(data[0].data).toBe('2026-01-15');
    expect(data[1].data).toBe('2026-02-01');
    expect(logs.length).toBeGreaterThan(0);
    // Summary log should be first
    expect(logs[0].column).toBe('ALL');
  });
});
