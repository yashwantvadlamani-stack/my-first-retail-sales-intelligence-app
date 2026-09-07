/**
 * Date Utilities specifically handling DD-MM-YYYY format and Excel Serial conversions
 */

/**
 * Validates whether a string matches DD-MM-YYYY (or DD/MM/YYYY, DD.MM.YYYY)
 */
export function isDDMMYYYY(str: string): boolean {
  if (!str) return false;
  return /^\d{1,2}[-/.](0?[1-9]|1[0-2])[-/.]\d{4}$/.test(String(str).trim());
}

/**
 * Parses Excel numeric date serials (e.g. 46055, 46056, 46143).
 * In Excel (Windows 1900 date system):
 * Serial 46055 corresponds to 2026-02-02 (02-02-2026).
 * Serial 46056 corresponds to 2026-02-03 (03-02-2026).
 * Serial 46143 corresponds to 2026-05-01 (01-05-2026).
 */
export function parseExcelSerial(val: unknown): Date | null {
  if (val === null || val === undefined || val === '') return null;
  const str = String(val).trim();

  // Avoid treating 4-digit years like "2026" as an Excel serial
  if (/^\d{4}$/.test(str)) {
    const yr = parseInt(str, 10);
    if (yr >= 1990 && yr <= 2050) return new Date(yr, 0, 1);
  }

  // Check numeric serials (e.g. 46055, 46056, 46143, 46055.0)
  const isNumberType = typeof val === 'number';
  const isNumericStr = /^\d{5,6}(\.\d+)?$/.test(str);

  if (isNumberType || isNumericStr) {
    const num = isNumberType ? val : parseFloat(str);
    if (!isNaN(num) && num >= 1000 && num <= 90000) {
      const wholeDays = Math.floor(num);
      const fractionalDay = num - wholeDays;
      // Excel 1900 leap year bug: serial >= 61 has epoch Dec 30, 1899; serial < 61 has epoch Dec 31, 1899
      const epoch = wholeDays >= 61 ? Date.UTC(1899, 11, 30) : Date.UTC(1899, 11, 31);
      const ms = epoch + wholeDays * 86400000 + Math.round(fractionalDay * 86400000);
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

/**
 * Parses any incoming date representation (DD-MM-YYYY, YYYY-MM-DD, Excel serial like 46055, or Date)
 * and returns a standard DD-MM-YYYY string.
 * Guaranteed to NEVER return 'invalid-date', 'Invalid Date', or raw numeric serials.
 */
export function formatToDDMMYYYY(input: unknown, fallbackDate?: Date): string {
  const getFallback = () => {
    const d = fallbackDate || new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (input === null || input === undefined || input === '') {
    return getFallback();
  }

  // 1. Check Excel serial (e.g. 46055, 46056, 46143)
  const excelDate = parseExcelSerial(input);
  if (excelDate) {
    const day = String(excelDate.getUTCDate()).padStart(2, '0');
    const month = String(excelDate.getUTCMonth() + 1).padStart(2, '0');
    const year = excelDate.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  // 2. If already native Date object
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return getFallback();
    const day = String(input.getDate()).padStart(2, '0');
    const month = String(input.getMonth() + 1).padStart(2, '0');
    const year = input.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const str = String(input).trim();
  const lower = str.toLowerCase();

  // Guard against unparseable or corrupted values
  if (
    lower === 'invalid-date' ||
    lower === 'invalid date' ||
    lower === 'nan' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'unknown' ||
    lower.startsWith('#')
  ) {
    return getFallback();
  }

  // 3. DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}-${month}-${year}`;
  }

  // 4. YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  // 5. Try standard JS Date parsing fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return getFallback();
}

/**
 * Converts a DD-MM-YYYY string to a native Date object
 */
export function parseDDMMYYYYToDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();

  // Check if it's an Excel serial first
  const excelD = parseExcelSerial(str);
  if (excelD) return excelD;

  const match = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const year = parseInt(match[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback to native Date
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Derives a fiscal/calendar week string (e.g. "Week 03") from a DD-MM-YYYY string
 */
export function getWeekFromDDMMYYYY(dateStr: string): string {
  const d = parseDDMMYYYYToDate(dateStr);
  if (!d) return 'Week 01';

  // Calculate day of year
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - startOfYear.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNum = Math.min(52, Math.max(1, Math.ceil(diff / oneWeek) + 1));
  return `Week ${String(weekNum).padStart(2, '0')}`;
}

/**
 * Compares two DD-MM-YYYY strings chronologically
 */
export function compareDDMMYYYY(a: string, b: string): number {
  const dateA = parseDDMMYYYYToDate(a);
  const dateB = parseDDMMYYYYToDate(b);
  if (!dateA || !dateB) return String(a).localeCompare(String(b));
  return dateA.getTime() - dateB.getTime();
}
