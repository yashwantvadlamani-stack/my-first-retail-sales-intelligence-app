import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  Moon,
  Sun,
  Upload,
  Download,
  Share2,
  Database,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  FileDown,
  Loader2,
  Check,
  ExternalLink,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  exportToCSV,
  exportInsightsToMarkdown,
  printExecutiveReport,
  exportDashboardToPDF,
} from '../utils/exporter';
import { formatToDDMMYYYY } from '../utils/dateUtils';
import { RetailRecord, KPIMetrics, AutomatedInsights, FilterState } from '../types/retail';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLoadSampleData: () => void;
  onClearData?: () => void;
  onOpenUpload: () => void;
  onOpenShare: () => void;
  currentDatasetName: string;
  isSampleData: boolean;
  records: RetailRecord[];
  kpis: KPIMetrics;
  insights: AutomatedInsights;
  filters: FilterState;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onLoadSampleData,
  onClearData,
  onOpenUpload,
  onOpenShare,
  currentDatasetName,
  isSampleData,
  records,
  kpis,
  insights,
  filters,
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('');
  const [pdfDownloadName, setPdfDownloadName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    exportToCSV(records, `retail_sales_${formatToDDMMYYYY(new Date())}.csv`);
    setExportMenuOpen(false);
  };

  const handleExportMarkdown = () => {
    exportInsightsToMarkdown(kpis, insights, records.length, filters);
    setExportMenuOpen(false);
  };

  const handleSavePrintFriendlyPDF = async () => {
    setExportMenuOpen(false);
    setIsExportingPDF(true);
    setPdfSuccess(false);
    setPdfDownloadUrl('');
    setPdfDownloadName('');
    setPdfStatus('Preparing print-friendly view...');

    try {
      const result = await exportDashboardToPDF({
        elementId: 'dashboard-printable-area',
        datasetName: currentDatasetName,
        recordsCount: records.length,
        filters,
        onProgress: (status) => setPdfStatus(status),
      });

      setPdfSuccess(true);
      setPdfDownloadUrl(result.blobUrl);
      setPdfDownloadName(result.filename);
      setPdfStatus('PDF ready and saved!');

      setTimeout(() => {
        setIsExportingPDF(false);
        setPdfSuccess(false);
        setPdfStatus('');
      }, 7000);
    } catch (err) {
      console.error('PDF export error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setPdfSuccess(false);
      setPdfStatus(`Export failed (${msg}). Try "Print Dashboard" instead.`);
      setTimeout(() => {
        setIsExportingPDF(false);
        setPdfStatus('');
      }, 6000);
    }
  };

  const handlePrintPDF = () => {
    printExecutiveReport();
    setExportMenuOpen(false);
  };

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        darkMode
          ? 'bg-slate-900/90 border-slate-800 text-white'
          : 'bg-white/90 border-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
                Retail Sales Intelligence
              </h1>
              <span className="hidden sm:inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                Enterprise Analytics
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 truncate">
                <Database className={`w-3 h-3 ${records.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="truncate">
                  {records.length > 0 ? currentDatasetName : 'No Dataset Loaded'}
                </span>
              </span>
              <span>•</span>
              <span>{records.length > 0 ? `${records.length} transactions` : 'Awaiting data upload'}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Sample Data Toggle / Load button */}
          <button
            type="button"
            id="btn-load-sample-data"
            onClick={onLoadSampleData}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              records.length === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : isSampleData
                ? darkMode
                  ? 'bg-slate-800/80 border-slate-700 text-blue-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 text-blue-700 hover:bg-slate-200'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500/20'
            }`}
            title="Load built-in retail sample dataset"
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">
              {records.length === 0 ? 'Load Sample Data' : isSampleData ? 'Reset Sample Data' : 'Load Sample Data'}
            </span>
            <span className="sm:hidden">Sample</span>
          </button>

          {/* Clear / Unload Data Button (visible when data is loaded) */}
          {records.length > 0 && onClearData && (
            <button
              type="button"
              id="btn-clear-dataset"
              onClick={onClearData}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                darkMode
                  ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-200'
              }`}
              title="Unload current data and return to generic homepage"
            >
              <span>Clear Data</span>
            </button>
          )}

          {/* Upload Data Button */}
          <button
            type="button"
            id="btn-open-upload-modal"
            onClick={onOpenUpload}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Upload Dataset</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              id="btn-export-dropdown-toggle"
              disabled={records.length === 0}
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                records.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  : exportMenuOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {exportMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-xl p-1.5 z-50 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                  Export Options
                </div>
                <button
                  type="button"
                  id="btn-export-csv"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-medium">Export Filtered Data (.csv)</div>
                    <div className="text-[10px] text-slate-400">Clean spreadsheet of current view</div>
                  </div>
                </button>
                <button
                  type="button"
                  id="btn-export-markdown"
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Download Insights (.md)</div>
                    <div className="text-[10px] text-slate-400">KPIs & narrative report</div>
                  </div>
                </button>
                <button
                  type="button"
                  id="btn-save-print-pdf"
                  onClick={handleSavePrintFriendlyPDF}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-medium">Save as Print Friendly PDF (.pdf)</div>
                    <div className="text-[10px] text-slate-400">Dashboard snapshot in clean print format</div>
                  </div>
                </button>
                <button
                  type="button"
                  id="btn-export-pdf"
                  onClick={handlePrintPDF}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-purple-500/10 hover:text-purple-600 transition-colors"
                >
                  <Printer className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-medium">Print Dashboard (Ctrl+P)</div>
                    <div className="text-[10px] text-slate-400">Standard browser print dialog</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Share App Button */}
          <button
            type="button"
            id="btn-open-share-modal"
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share App</span>
            <span className="sm:hidden">Share</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            id="btn-toggle-dark-mode"
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            className={`p-2 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PDF Export Progress Toast Notification */}
      {isExportingPDF && (
        <div
          id="pdf-export-toast"
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 p-4 rounded-xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700 max-w-sm w-88"
        >
          <div className="flex items-start gap-3">
            {pdfSuccess ? (
              <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                <Check className="w-4 h-4" />
              </div>
            ) : pdfStatus.includes('failed') ? (
              <div className="p-1 rounded-full bg-rose-500/20 text-rose-400 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-blue-500/20 text-blue-400 shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-semibold text-slate-100 flex items-center justify-between">
                <span>{pdfSuccess ? 'Download Ready' : 'Print Friendly PDF'}</span>
                <button
                  type="button"
                  onClick={() => setIsExportingPDF(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                  aria-label="Close toast"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-slate-400 mt-1 break-words">{pdfStatus}</div>
            </div>
          </div>

          {/* Action buttons if PDF succeeded */}
          {pdfSuccess && pdfDownloadUrl && (
            <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-800">
              <a
                href={pdfDownloadUrl}
                download={pdfDownloadName}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </a>
              <a
                href={pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </a>
            </div>
          )}

          {/* Fallback print action if PDF generation failed */}
          {pdfStatus.includes('failed') && (
            <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsExportingPDF(false);
                  printExecutiveReport();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dialog (Ctrl+P)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
