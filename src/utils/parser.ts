import * as XLSX from 'xlsx';
import { RetailRecord } from '../types/retail';
import { formatToDDMMYYYY, getWeekFromDDMMYYYY, parseDDMMYYYYToDate } from './dateUtils';

export interface ColumnMapping {
  date: string;
  week: string;
  region: string;
  city: string;
  store: string;
  storeFormat: string;
  productCategory: string;
  productName: string;
  grossSales: string;
  netSales: string;
  targetSales: string;
  returnAmount: string;
  discountAmount: string;
  inventoryLevel: string;
  reorderLevel: string;
  ordersCount: string;
}

export interface ParseResult {
  records: RetailRecord[];
  headers: string[];
  detectedMapping: ColumnMapping;
  fileName: string;
  errors: string[];
}

const ALIASES: Record<keyof ColumnMapping, string[]> = {
  date: [
    'week_start_date',
    'weekstartdate',
    'week_start',
    'weekstart',
    'week_date',
    'weekdate',
    'start_date',
    'startdate',
    'transaction_date',
    'transactiondate',
    'sale_date',
    'saledate',
    'order_date',
    'orderdate',
    'period_date',
    'perioddate',
    'date',
    'day',
  ],
  week: [
    'fiscal_week',
    'sales_week',
    'week_number',
    'week_no',
    'week_num',
    'wk_no',
    'wk_num',
    'week_name',
    'week_label',
    'week',
    'wk',
    'period',
  ],
  region: ['region', 'territory', 'market', 'area', 'zone', 'district'],
  city: ['city', 'location', 'metro', 'municipality', 'town'],
  store: ['store', 'store_name', 'store_id', 'branch', 'store_location', 'outlet_name'],
  storeFormat: ['store_format', 'storeformat', 'format', 'store_type', 'type', 'channel'],
  productCategory: ['product_category', 'category', 'merchandise', 'dept', 'department', 'line'],
  productName: ['product_name', 'product', 'item_name', 'sku_name', 'item', 'description'],
  grossSales: ['gross_sales', 'grosssales', 'gross', 'gross_revenue', 'total_sales'],
  netSales: ['net_sales', 'netsales', 'net', 'net_revenue', 'sales', 'revenue', 'actual_sales'],
  targetSales: ['target_sales', 'targetsales', 'target', 'sales_target', 'quota', 'budget', 'goal'],
  returnAmount: ['return_amount', 'returnamount', 'returns', 'return_amt', 'refunds', 'refund_amount'],
  discountAmount: ['discount_amount', 'discountamount', 'discounts', 'discount_amt', 'markdown', 'promo_discount'],
  inventoryLevel: ['inventory_level', 'inventorylevel', 'inventory', 'stock', 'stock_on_hand', 'units_on_hand', 'current_inventory'],
  reorderLevel: ['reorder_level', 'reorderlevel', 'reorder_point', 'safety_stock', 'min_inventory', 'reorder_threshold'],
  ordersCount: ['orders_count', 'orders', 'transactions', 'trans_count', 'order_count', 'transactions_count', 'receipts'],
};

function normalizeHeader(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    date: '',
    week: '',
    region: '',
    city: '',
    store: '',
    storeFormat: '',
    productCategory: '',
    productName: '',
    grossSales: '',
    netSales: '',
    targetSales: '',
    returnAmount: '',
    discountAmount: '',
    inventoryLevel: '',
    reorderLevel: '',
    ordersCount: '',
  };

  const normalizedHeaders = headers.map((h) => ({
    original: h,
    norm: normalizeHeader(h),
  }));

  for (const field of Object.keys(ALIASES) as (keyof ColumnMapping)[]) {
    const fieldAliases = ALIASES[field];

    let matched: { original: string; norm: string } | undefined;

    if (field === 'week') {
      // Do not allow week to match headers that represent dates (e.g. week_start_date)
      matched = normalizedHeaders.find((h) => {
        if (h.norm.includes('date') || h.norm.includes('start')) return false;
        return fieldAliases.some(
          (alias) => normalizeHeader(alias) === h.norm || h.norm.includes(normalizeHeader(alias))
        );
      });
    } else {
      // First, try exact matches with field name or aliases
      matched = normalizedHeaders.find((h) =>
        fieldAliases.some((alias) => normalizeHeader(alias) === h.norm)
      );

      // Second, try substring containment
      if (!matched) {
        matched = normalizedHeaders.find((h) =>
          fieldAliases.some((alias) => h.norm.includes(normalizeHeader(alias)))
        );
      }
    }

    if (matched) {
      mapping[field] = matched.original;
    }
  }

  // Fallback: If date was not detected but a header contains 'start' or 'date', use it
  if (!mapping.date) {
    const candidate = normalizedHeaders.find(
      (h) => h.norm.includes('date') || h.norm.includes('start')
    );
    if (candidate) {
      mapping.date = candidate.original;
    }
  }

  return mapping;
}

function parseNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }
  if (!value) return fallback;
  const str = String(value).replace(/[\$,]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

function parseString(value: unknown, fallback: string = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

export function convertRawDataToRecords(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping
): RetailRecord[] {
  let rollingDate: Date | null = null;

  return rows.map((row, idx) => {
    // 1. Identify raw date candidate from mapping, or explicit 'week_start_date' / 'date' columns
    let rawDateCandidate =
      row[mapping.date] ??
      row['week_start_date'] ??
      row['Week_Start_Date'] ??
      row['weekstartdate'] ??
      row['Week Start Date'] ??
      row['week_date'] ??
      row['date'] ??
      row['Date'];

    const rawWeekVal = row[mapping.week];

    // If date candidate is missing or empty, but rawWeekVal looks like a date or Excel serial number
    if (
      (rawDateCandidate === null || rawDateCandidate === undefined || rawDateCandidate === '') &&
      rawWeekVal !== null &&
      rawWeekVal !== undefined &&
      rawWeekVal !== ''
    ) {
      rawDateCandidate = rawWeekVal;
    }

    // Format candidate into DD-MM-YYYY using robust formatToDDMMYYYY
    const dateFormatted = formatToDDMMYYYY(rawDateCandidate, rollingDate || undefined);

    // Update rollingDate for smooth sequential fallback
    const parsedD = parseDDMMYYYYToDate(dateFormatted);
    if (parsedD) {
      rollingDate = parsedD;
    }

    // Determine week value:
    // If rawWeekVal is an actual week designation (like "Week 01", "W1", "Fiscal Wk 3") and NOT an Excel serial or date:
    const rawWeekStr = parseString(rawWeekVal);
    const isWeekRawDateOrSerial =
      !rawWeekStr ||
      /^\d{5,6}/.test(rawWeekStr) ||
      rawWeekStr.toLowerCase() === 'invalid-date' ||
      rawWeekStr.toLowerCase() === 'invalid date' ||
      rawWeekStr.includes('-') ||
      rawWeekStr.includes('/');

    let weekVal: string;
    if (!isWeekRawDateOrSerial && rawWeekStr.length > 0) {
      weekVal = rawWeekStr;
    } else {
      // Use the DD-MM-YYYY date as the week value for trend plotting and filtering
      weekVal = dateFormatted;
    }

    const netSales = parseNumber(row[mapping.netSales], 0);
    const grossSales = parseNumber(row[mapping.grossSales], netSales * 1.08);
    const targetSales = parseNumber(row[mapping.targetSales], netSales * 0.95);
    const returnAmount = parseNumber(row[mapping.returnAmount], 0);
    const discountAmount = parseNumber(row[mapping.discountAmount], grossSales > netSales ? grossSales - netSales : 0);
    const inventoryLevel = Math.max(0, Math.round(parseNumber(row[mapping.inventoryLevel], 50)));
    const reorderLevel = Math.max(0, Math.round(parseNumber(row[mapping.reorderLevel], 25)));
    const ordersCount = Math.max(1, Math.round(parseNumber(row[mapping.ordersCount], Math.max(1, Math.round(netSales / 180)))));

    return {
      id: `upload-rec-${idx + 1}`,
      date: dateFormatted,
      week: weekVal,
      region: parseString(row[mapping.region], 'General Region'),
      city: parseString(row[mapping.city], 'Metro Area'),
      store: parseString(row[mapping.store], `Store #${idx + 101}`),
      storeFormat: parseString(row[mapping.storeFormat], 'Flagship'),
      productCategory: parseString(row[mapping.productCategory], 'General Merchandise'),
      productName: parseString(row[mapping.productName], `SKU-${idx + 100}`),
      grossSales,
      netSales,
      targetSales,
      returnAmount,
      discountAmount,
      inventoryLevel,
      reorderLevel,
      ordersCount,
    };
  });
}

export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const errors: string[] = [];

  if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
    throw new Error('Unsupported file format. Please upload a .csv or .xlsx file.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, dateNF: 'dd-mm-yyyy' });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded file does not contain any readable sheets.');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
  });

  if (rawJson.length === 0) {
    throw new Error('The uploaded file contains no data rows.');
  }

  const headers = Object.keys(rawJson[0]);
  const detectedMapping = detectColumnMapping(headers);

  // Validate critical fields
  if (!detectedMapping.netSales && !detectedMapping.grossSales) {
    errors.push('Could not detect a "Net Sales" or "Gross Sales" column. Using fallback mapping.');
  }

  const records = convertRawDataToRecords(rawJson, detectedMapping);

  return {
    records,
    headers,
    detectedMapping,
    fileName: file.name,
    errors,
  };
}
