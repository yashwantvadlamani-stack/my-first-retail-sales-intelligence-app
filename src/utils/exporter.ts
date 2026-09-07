import { RetailRecord, KPIMetrics, AutomatedInsights, FilterState } from '../types/retail';
import { formatToDDMMYYYY } from './dateUtils';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export function exportToCSV(records: RetailRecord[], filename = 'retail_sales_filtered_data.csv') {
  if (records.length === 0) {
    alert('No data available to export.');
    return;
  }

  const headers = [
    'Date',
    'Week',
    'Region',
    'City',
    'Store',
    'Store Format',
    'Product Category',
    'Product Name',
    'Gross Sales ($)',
    'Net Sales ($)',
    'Target Sales ($)',
    'Return Amount ($)',
    'Discount Amount ($)',
    'Inventory Level',
    'Reorder Level',
    'Orders Count',
  ];

  const rows = records.map((r) => [
    `"${r.date}"`,
    `"${r.week}"`,
    `"${r.region}"`,
    `"${r.city}"`,
    `"${r.store}"`,
    `"${r.storeFormat}"`,
    `"${r.productCategory}"`,
    `"${(r.productName || '').replace(/"/g, '""')}"`,
    r.grossSales.toFixed(2),
    r.netSales.toFixed(2),
    r.targetSales.toFixed(2),
    r.returnAmount.toFixed(2),
    r.discountAmount.toFixed(2),
    r.inventoryLevel,
    r.reorderLevel,
    r.ordersCount,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInsightsToMarkdown(
  kpis: KPIMetrics,
  insights: AutomatedInsights,
  recordCount: number,
  activeFilters: FilterState,
  filename = 'retail_intelligence_insights_report.md'
) {
  const now = new Date();
  const timestamp = `${formatToDDMMYYYY(now)} ${now.toLocaleTimeString()}`;

  const filterSummary = [
    activeFilters.regions.length ? `Regions: ${activeFilters.regions.join(', ')}` : 'Regions: All',
    activeFilters.cities.length ? `Cities: ${activeFilters.cities.join(', ')}` : 'Cities: All',
    activeFilters.stores.length ? `Stores: ${activeFilters.stores.join(', ')}` : 'Stores: All',
    activeFilters.storeFormats.length ? `Formats: ${activeFilters.storeFormats.join(', ')}` : 'Formats: All',
    activeFilters.categories.length ? `Categories: ${activeFilters.categories.join(', ')}` : 'Categories: All',
    activeFilters.timePeriods.length ? `Weeks: ${activeFilters.timePeriods.join(', ')}` : 'Weeks: All',
  ].join(' | ');

  const md = `# Retail Sales Intelligence Executive Briefing
**Generated:** ${timestamp}  
**Dataset Scope:** ${recordCount} Transactions | **Active Filters:** ${filterSummary}

---

## 1. High-Level KPI Summary
| Metric | Value | Benchmark / Status |
| :--- | :--- | :--- |
| **Total Net Sales** | $${kpis.totalNetSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Quota: $${kpis.totalTargetSales.toLocaleString()} |
| **Target Achievement** | **${kpis.targetAchievement.toFixed(1)}%** | ${kpis.targetAchievement >= 100 ? '✅ Target Met / Exceeded' : kpis.targetAchievement >= 90 ? '⚠️ Within 10% of Quota' : '❌ Deficit Alert'} |
| **Sales Deficit / Gap** | $${kpis.salesGap.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${kpis.salesGap >= 0 ? 'Surplus' : 'Deficit'} |
| **Avg Transaction Value (ATV)** | $${kpis.atv.toFixed(2)} | Over ${kpis.totalOrders.toLocaleString()} Total Orders |
| **Return Rate** | **${kpis.returnRate.toFixed(1)}%** | Threshold: 10.0% ($${kpis.totalReturnAmount.toLocaleString()} refunded) |
| **Discount Rate** | **${kpis.discountRate.toFixed(1)}%** | Total Promotional Markdown: $${kpis.totalDiscountAmount.toLocaleString()} |

---

## 2. Automated Executive Narrative
${insights.executiveSummary}

---

## 3. Critical Operational Findings

### A. Regional Performance Disparities
* **Best Performing Region:** **${insights.bestRegion.name}**
  * Net Sales: $${insights.bestRegion.sales.toLocaleString()}
  * Target Achievement: ${insights.bestRegion.achievement.toFixed(1)}%
* **Worst Performing Region:** **${insights.worstRegion.name}**
  * Net Sales: $${insights.worstRegion.sales.toLocaleString()}
  * Target Achievement: ${insights.worstRegion.achievement.toFixed(1)}%

### B. Stores Missing Target (Underperformance Deficit)
${
  insights.storesMissingTarget.length === 0
    ? 'No stores are currently missing target.'
    : insights.storesMissingTarget
        .map(
          (s, i) =>
            `${i + 1}. **${s.store}**: Achieved **${s.achievement.toFixed(1)}%** (Net: $${s.netSales.toLocaleString()} / Target: $${s.target.toLocaleString()}) — **Deficit: -$${s.deficit.toLocaleString()}**`
        )
        .join('\n')
}

### C. High-Return Categories (> 10% Threshold)
${
  insights.highReturnCategories.length === 0
    ? 'All product categories are operating below the 10% return threshold.'
    : insights.highReturnCategories
        .map(
          (c, i) =>
            `${i + 1}. **${c.category}**: **${c.returnRate.toFixed(1)}%** return rate ($${c.returnAmount.toLocaleString()} returned against $${c.netSales.toLocaleString()} net sales)`
        )
        .join('\n')
}

### D. Inventory Stockout Risk Warnings
* **Total Line Items Below Reorder Point:** ${insights.stockoutCount}
${
  insights.criticalStockouts.length > 0
    ? '\n**Top Stockout Priorities:**\n' +
      insights.criticalStockouts
        .slice(0, 5)
        .map(
          (item) =>
            `- **[${item.urgency.toUpperCase()}]** ${item.productName} at ${item.store} (${item.region}): Current Stock ${item.inventoryLevel} units (Reorder Point: ${item.reorderLevel} units, Deficit: ${item.deficitUnits} units)`
        )
        .join('\n')
    : ''
}

---

## 4. Key Recommendations & Action Items
${insights.keyRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*Report generated by Retail Sales Intelligence Dashboard*
`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printExecutiveReport() {
  window.print();
}

export interface PDFExportOptions {
  elementId?: string;
  filename?: string;
  datasetName?: string;
  recordsCount?: number;
  filters?: FilterState;
  onProgress?: (status: string) => void;
}

export interface PDFExportResult {
  filename: string;
  blobUrl: string;
}

export async function exportDashboardToPDF(options: PDFExportOptions = {}): Promise<PDFExportResult> {
  const {
    elementId = 'dashboard-printable-area',
    filename,
    datasetName = 'Enterprise Retail Dataset',
    recordsCount = 0,
    onProgress,
  } = options;

  const targetEl = document.getElementById(elementId);
  if (!targetEl) {
    throw new Error(`Printable dashboard element #${elementId} not found.`);
  }

  onProgress?.('Preparing print-friendly layout...');

  const now = new Date();
  const dateStr = formatToDDMMYYYY(now);
  const defaultFilename = `retail_dashboard_report_${dateStr}.pdf`;
  const finalFilename = filename || defaultFilename;

  // 1. Temporarily display executive print header in the live DOM
  const printHeader = document.getElementById('print-executive-header');
  const wasHeaderHidden = printHeader ? printHeader.classList.contains('hidden') : false;
  if (printHeader) {
    printHeader.classList.remove('hidden');
    printHeader.style.setProperty('display', 'block', 'important');
  }

  // 2. Temporarily hide interactive controls with .no-print in the target element
  const noPrintEls = Array.from(targetEl.querySelectorAll('.no-print')) as HTMLElement[];
  const prevDisplays = noPrintEls.map((el) => el.style.display);
  noPrintEls.forEach((el) => {
    el.style.setProperty('display', 'none', 'important');
  });

  let canvas: HTMLCanvasElement;

  try {
    // Settle DOM and wait for repaint
    await new Promise((r) => setTimeout(r, 180));

    onProgress?.('Capturing high-resolution snapshot...');

    const rect = targetEl.getBoundingClientRect();
    const renderWidth = Math.max(rect.width, 1080);

    canvas = await html2canvas(targetEl, {
      scale: 1.75, // ~180-250 DPI high resolution without exceeding device GPU canvas memory
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: renderWidth,
    });
  } finally {
    // 3. Guaranteed DOM cleanup and restoration
    if (printHeader) {
      printHeader.style.removeProperty('display');
      if (wasHeaderHidden) {
        printHeader.classList.add('hidden');
      }
    }
    noPrintEls.forEach((el, idx) => {
      if (prevDisplays[idx]) {
        el.style.display = prevDisplays[idx];
      } else {
        el.style.removeProperty('display');
      }
    });
  }

  onProgress?.('Formatting multi-page PDF document...');

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidthMm = 210;
  const pageHeightMm = 297;
  const marginMm = 8;
  const printableWidthMm = pageWidthMm - marginMm * 2; // 194 mm
  const printableHeightMm = pageHeightMm - marginMm * 2 - 8; // 273 mm (leaving space for bottom footer)

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const pxPerMm = canvasWidth / printableWidthMm;
  const maxPageCanvasHeight = Math.floor(printableHeightMm * pxPerMm);

  // Measure sections for smart boundary splitting
  const sectionElements = Array.from(targetEl.querySelectorAll('.pdf-section')) as HTMLElement[];
  const sectionSplitYs: number[] = [];

  if (sectionElements.length > 0) {
    const containerRect = targetEl.getBoundingClientRect();
    const actualScale = containerRect.width > 0 ? canvasWidth / containerRect.width : 1.75;
    for (const sec of sectionElements) {
      const secRect = sec.getBoundingClientRect();
      const topOffsetPx = (secRect.top - containerRect.top) * actualScale;
      if (topOffsetPx > 0 && topOffsetPx < canvasHeight) {
        sectionSplitYs.push(Math.round(topOffsetPx));
      }
    }
  }

  // Calculate page splits
  const pageSplits: number[] = [];
  let currentY = 0;

  while (currentY < canvasHeight) {
    const targetY = currentY + maxPageCanvasHeight;
    if (targetY >= canvasHeight) {
      pageSplits.push(canvasHeight);
      break;
    }

    // Find section boundary that fits within targetY
    const candidates = sectionSplitYs.filter((y) => y > currentY + 300 && y <= targetY);
    if (candidates.length > 0) {
      const bestSplit = Math.max(...candidates);
      pageSplits.push(bestSplit);
      currentY = bestSplit;
    } else {
      pageSplits.push(targetY);
      currentY = targetY;
    }
  }

  const totalPages = pageSplits.length;
  let startY = 0;

  for (let i = 0; i < totalPages; i++) {
    const endY = pageSplits[i];
    const sliceHeight = endY - startY;
    if (sliceHeight <= 0) continue;

    // Create slice canvas
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvasWidth;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, sliceHeight);
      ctx.drawImage(
        canvas,
        0,
        startY,
        canvasWidth,
        sliceHeight,
        0,
        0,
        canvasWidth,
        sliceHeight
      );
    }

    const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
    const sliceHeightMm = sliceHeight / pxPerMm;

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'JPEG', marginMm, marginMm, printableWidthMm, sliceHeightMm);

    // Print footer on each page
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text(
      `Retail Sales Intelligence • ${datasetName} • Generated: ${dateStr}`,
      marginMm,
      pageHeightMm - 4
    );
    pdf.text(
      `Page ${i + 1} of ${totalPages}`,
      pageWidthMm - marginMm,
      pageHeightMm - 4,
      { align: 'right' }
    );

    startY = endY;
  }

  onProgress?.('Preparing file download...');

  let blobUrl = '';
  try {
    const blob = pdf.output('blob');
    blobUrl = URL.createObjectURL(blob);
  } catch (blobErr) {
    console.warn('Blob creation warning:', blobErr);
  }

  let downloaded = false;

  // Method 1: Programmatic link click with Blob URL
  if (blobUrl) {
    try {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = finalFilename;
      a.rel = 'noopener';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) {
          a.parentNode.removeChild(a);
        }
      }, 2000);
      downloaded = true;
    } catch (aErr) {
      console.warn('Anchor download fallback warning:', aErr);
    }
  }

  // Method 2: jsPDF standard save
  if (!downloaded) {
    try {
      pdf.save(finalFilename);
      downloaded = true;
    } catch (saveErr) {
      console.warn('pdf.save warning:', saveErr);
    }
  }

  return {
    filename: finalFilename,
    blobUrl,
  };
}

export function generateShareableUrl(filters: FilterState): string {
  const url = new URL(window.location.href);
  
  if (filters.regions.length) url.searchParams.set('regions', filters.regions.join(','));
  else url.searchParams.delete('regions');

  if (filters.cities.length) url.searchParams.set('cities', filters.cities.join(','));
  else url.searchParams.delete('cities');

  if (filters.stores.length) url.searchParams.set('stores', filters.stores.join(','));
  else url.searchParams.delete('stores');

  if (filters.storeFormats.length) url.searchParams.set('formats', filters.storeFormats.join(','));
  else url.searchParams.delete('formats');

  if (filters.categories.length) url.searchParams.set('categories', filters.categories.join(','));
  else url.searchParams.delete('categories');

  if (filters.timePeriods.length) url.searchParams.set('weeks', filters.timePeriods.join(','));
  else url.searchParams.delete('weeks');

  return url.toString();
}

export function parseFiltersFromUrl(): Partial<FilterState> {
  const params = new URLSearchParams(window.location.search);
  const result: Partial<FilterState> = {};

  const regions = params.get('regions');
  if (regions) result.regions = regions.split(',').filter(Boolean);

  const cities = params.get('cities');
  if (cities) result.cities = cities.split(',').filter(Boolean);

  const stores = params.get('stores');
  if (stores) result.stores = stores.split(',').filter(Boolean);

  const formats = params.get('formats');
  if (formats) result.storeFormats = formats.split(',').filter(Boolean);

  const categories = params.get('categories');
  if (categories) result.categories = categories.split(',').filter(Boolean);

  const weeks = params.get('weeks');
  if (weeks) result.timePeriods = weeks.split(',').filter(Boolean);

  return result;
}
