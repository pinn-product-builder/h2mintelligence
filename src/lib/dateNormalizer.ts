/**
 * Date Normalizer — Robust parsing for BR, ISO, Excel serial and month-name formats.
 * Outputs ISO 8601 date strings (YYYY-MM-DD) and provides a conversion log.
 */

export interface DateConversionLog {
  original: string;
  detected: DateFormat | 'unknown';
  normalized: string | null;
  row?: number;
  column?: string;
}

export type DateFormat =
  | 'iso'           // 2026-01-15
  | 'br'            // 15/01/2026
  | 'br_short'      // 15/01/26
  | 'us'            // 01/15/2026
  | 'excel_serial'  // 46037
  | 'month_year_br' // Jan/2026, Fev/2026
  | 'month_year_en' // Jan-2026, Feb 2026
  | 'iso_datetime'  // 2026-01-15T00:00:00
  | 'br_dash'       // 15-01-2026
  | 'year_month';   // 2026-01

const BR_MONTHS: Record<string, number> = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

const EN_MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** Excel epoch: Jan 0, 1900 (with Lotus 1-2-3 bug for day 60) */
function excelSerialToDate(serial: number): Date | null {
  if (serial < 1 || serial > 2958465) return null; // ~1900 to 9999
  // Adjust for Excel's incorrect leap year 1900
  const adjusted = serial > 59 ? serial - 1 : serial;
  const epoch = new Date(1899, 11, 31); // Dec 31, 1899
  epoch.setDate(epoch.getDate() + adjusted);
  return epoch;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export interface NormalizeDateResult {
  value: string | null;
  format: DateFormat | 'unknown';
}

/**
 * Attempts to parse a single date value into YYYY-MM-DD.
 * Returns the detected format and normalized value.
 */
export function normalizeDate(raw: unknown): NormalizeDateResult {
  if (raw === null || raw === undefined || raw === '') {
    return { value: null, format: 'unknown' };
  }

  // Handle Date objects (from SheetJS cellDates)
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return {
      value: toISO(raw.getFullYear(), raw.getMonth() + 1, raw.getDate()),
      format: 'iso_datetime',
    };
  }

  // Handle pure numbers — Excel serial date
  if (typeof raw === 'number') {
    // Excel serial dates for year 2000+ start at ~36526
    if (raw >= 36526 && raw <= 2958465) {
      const d = excelSerialToDate(raw);
      if (d) {
        return {
          value: toISO(d.getFullYear(), d.getMonth() + 1, d.getDate()),
          format: 'excel_serial',
        };
      }
    }
    return { value: null, format: 'unknown' };
  }

  const str = String(raw).trim();
  if (!str) return { value: null, format: 'unknown' };

  // ISO datetime: 2026-01-15T00:00:00...
  const isoDateTimeMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ]/);
  if (isoDateTimeMatch) {
    const [, y, m, d] = isoDateTimeMatch.map(Number);
    if (isValidDate(y, m, d)) {
      return { value: toISO(y, m, d), format: 'iso_datetime' };
    }
  }

  // ISO: 2026-01-15
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch.map(Number);
    if (isValidDate(y, m, d)) {
      return { value: toISO(y, m, d), format: 'iso' };
    }
  }

  // Year-month: 2026-01
  const yearMonthMatch = str.match(/^(\d{4})-(\d{2})$/);
  if (yearMonthMatch) {
    const [, y, m] = yearMonthMatch.map(Number);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12) {
      return { value: toISO(y, m, 1), format: 'year_month' };
    }
  }

  // BR: 15/01/2026 or 15-01-2026
  const brMatch = str.match(/^(\d{2})[/\-.](\d{2})[/\-.](\d{4})$/);
  if (brMatch) {
    const day = parseInt(brMatch[1]);
    const month = parseInt(brMatch[2]);
    const year = parseInt(brMatch[3]);
    const fmt: DateFormat = str.includes('-') ? 'br_dash' : 'br';
    if (isValidDate(year, month, day)) {
      return { value: toISO(year, month, day), format: fmt };
    }
    // Try US fallback (mm/dd/yyyy) if BR fails
    if (isValidDate(year, day, month)) {
      return { value: toISO(year, day, month), format: 'us' };
    }
  }

  // BR short: 15/01/26
  const brShortMatch = str.match(/^(\d{2})[/\-.](\d{2})[/\-.](\d{2})$/);
  if (brShortMatch) {
    const day = parseInt(brShortMatch[1]);
    const month = parseInt(brShortMatch[2]);
    let year = parseInt(brShortMatch[3]);
    year = year >= 50 ? 1900 + year : 2000 + year;
    if (isValidDate(year, month, day)) {
      return { value: toISO(year, month, day), format: 'br_short' };
    }
  }

  // Month/Year BR: Jan/2026, Fev-2026, Mar 2026
  const monthYearBrMatch = str.match(/^([A-Za-zÀ-ú]{3,})[/\-\s](\d{4})$/);
  if (monthYearBrMatch) {
    const monthStr = monthYearBrMatch[1].toLowerCase().substring(0, 3);
    const year = parseInt(monthYearBrMatch[2]);
    const month = BR_MONTHS[monthStr] || EN_MONTHS[monthStr];
    if (month && year >= 1900 && year <= 2100) {
      return {
        value: toISO(year, month, 1),
        format: BR_MONTHS[monthStr] ? 'month_year_br' : 'month_year_en',
      };
    }
  }

  // Numeric string that could be Excel serial (e.g. "46037")
  if (/^\d{4,6}$/.test(str)) {
    const serial = parseInt(str);
    if (serial >= 36526) { // year 2000+
      const d = excelSerialToDate(serial);
      if (d) {
        return {
          value: toISO(d.getFullYear(), d.getMonth() + 1, d.getDate()),
          format: 'excel_serial',
        };
      }
    }
  }

  return { value: null, format: 'unknown' };
}

/**
 * Heuristic: detect which columns in a dataset are likely date columns.
 * Samples the first N rows looking for date-like values.
 */
export function detectDateColumns(
  data: Record<string, unknown>[],
  columns: string[],
  sampleSize = 10
): string[] {
  const dateColumns: string[] = [];
  const sample = data.slice(0, sampleSize);

  for (const col of columns) {
    let dateHits = 0;
    let nonEmpty = 0;

    for (const row of sample) {
      const val = row[col];
      if (val === null || val === undefined || val === '') continue;
      nonEmpty++;
      const result = normalizeDate(val);
      if (result.value !== null) dateHits++;
    }

    // If >50% of non-empty values parse as dates, it's a date column
    if (nonEmpty > 0 && dateHits / nonEmpty > 0.5) {
      dateColumns.push(col);
    }
  }

  return dateColumns;
}

/**
 * Normalize all date columns in a dataset in-place.
 * Returns a detailed conversion log.
 */
export function normalizeDateColumns(
  data: Record<string, unknown>[],
  dateColumns: string[]
): DateConversionLog[] {
  const logs: DateConversionLog[] = [];
  const formatCounts: Record<string, number> = {};

  for (let i = 0; i < data.length; i++) {
    for (const col of dateColumns) {
      const original = data[i][col];
      if (original === null || original === undefined || original === '') continue;

      const result = normalizeDate(original);

      if (result.value) {
        data[i][col] = result.value;
        formatCounts[result.format] = (formatCounts[result.format] || 0) + 1;
      }

      // Log first 20 conversions + any failures
      if (logs.length < 20 || result.value === null) {
        logs.push({
          original: String(original),
          detected: result.format,
          normalized: result.value,
          row: i + 1,
          column: col,
        });
      }
    }
  }

  // Add a summary log
  if (Object.keys(formatCounts).length > 0) {
    const summary = Object.entries(formatCounts)
      .map(([fmt, count]) => `${fmt}: ${count}`)
      .join(', ');
    logs.unshift({
      original: `[RESUMO] Formatos detectados: ${summary}`,
      detected: 'unknown',
      normalized: `Total: ${Object.values(formatCounts).reduce((a, b) => a + b, 0)} datas convertidas`,
      row: 0,
      column: 'ALL',
    });
  }

  return logs;
}
