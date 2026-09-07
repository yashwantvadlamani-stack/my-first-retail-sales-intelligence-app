import React, { useState, useRef } from 'react';
import {
  Upload,
  Database,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Package,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { parseFile, convertRawDataToRecords, ColumnMapping } from '../utils/parser';
import { RetailRecord } from '../types/retail';
import { INITIAL_SAMPLE_DATA } from '../data/sampleData';
import { exportToCSV } from '../utils/exporter';
import * as XLSX from 'xlsx';

interface EmptyStateViewProps {
  onLoadSampleData: () => void;
  onDataLoaded: (records: RetailRecord[], fileName: string) => void;
  darkMode: boolean;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  onLoadSampleData,
  onDataLoaded,
  darkMode,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
        throw new Error('Please upload a valid .csv or .xlsx / .xls spreadsheet.');
      }

      const result = await parseFile(file);
      onDataLoaded(result.records, file.name);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file. Please check format.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    exportToCSV(INITIAL_SAMPLE_DATA.slice(0, 5), 'retail_sales_schema_template.csv');
  };

  const schemaColumns = [
    { name: 'Date / Week', desc: 'e.g. 15-01-2026 (DD-MM-YYYY) or Week 02', required: true },
    { name: 'Region & City', desc: 'Geographic territory mapping', required: true },
    { name: 'Store & Format', desc: 'Flagship, Express, Outlet', required: true },
    { name: 'Product Category', desc: 'Merchandise group / department', required: true },
    { name: 'Net & Gross Sales', desc: 'Actual realized revenue & GMV', required: true },
    { name: 'Target Sales', desc: 'Sales quota for period', required: true },
    { name: 'Return Amount', desc: 'Customer refunds and returns', required: false },
    { name: 'Discount Amount', desc: 'Promotional markdowns', required: false },
    { name: 'Inventory & Reorder', desc: 'Stock on hand vs. threshold', required: false },
  ];

  return (
    <div id="generic-empty-homepage" className="space-y-8 py-6">
      {/* Hero Welcome Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Interactive Retail Sales Analytics</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Retail Sales Intelligence Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Upload your retail transaction spreadsheet to compute key performance metrics, uncover margin leakages,
          monitor stockout risks, and review automated business insights.
        </p>
      </div>

      {/* Primary Ingestion Card: Upload or Load Sample */}
      <div
        className={`max-w-3xl mx-auto rounded-2xl border p-6 sm:p-8 transition-all ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          id="homepage-file-dropzone"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-500/5 scale-[0.99]'
              : darkMode
              ? 'border-slate-700 hover:border-blue-500/60 bg-slate-800/30'
              : 'border-slate-300 hover:border-blue-500 bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className={`font-semibold text-base mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {loading ? 'Processing Spreadsheet...' : 'Drop your retail dataset here to begin'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Supports .CSV and .XLSX spreadsheets. Columns are automatically mapped to calculate Net Sales, ATV, Target Achievement, and Stockout Risks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
            >
              Select File from Computer
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadTemplate();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>

        {/* Divider with "OR" */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative inline-block px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold bg-white dark:bg-slate-900">
            Or test with sample data
          </div>
        </div>

        {/* Sample Dataset Button */}
        <div className="text-center">
          <button
            type="button"
            id="btn-homepage-load-sample"
            onClick={onLoadSampleData}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
              darkMode
                ? 'bg-slate-800/80 border-slate-700 text-emerald-400 hover:bg-slate-800 hover:border-emerald-500/40'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-500" />
            <span>Load Sample Retail Dataset</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 font-medium">
              54 Transactions • 12 Weeks
            </span>
          </button>
          <p className="text-[11px] text-slate-400 mt-2">
            Loads a realistic multi-region, multi-store retail dataset to immediately preview interactive charts and insights.
          </p>
        </div>
      </div>

      {/* Capabilities / Feature Architecture Cards */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
          What the dashboard computes automatically
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-xl border text-xs ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mb-1">KPIs & Revenue Quota</div>
            <p className="text-slate-500 dark:text-slate-400 leading-normal">
              Net Sales, Target Achievement % with color grading, and Average Transaction Value (ATV).
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border text-xs ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-2.5">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mb-1">Visual Analytics</div>
            <p className="text-slate-500 dark:text-slate-400 leading-normal">
              Weekly pacing line trends, regional sales distribution, and stacked category discount/return breakdowns.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border text-xs ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="p-2 w-fit rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-2.5">
              <Package className="w-4 h-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mb-1">Inventory Risk Alerts</div>
            <p className="text-slate-500 dark:text-slate-400 leading-normal">
              Autonomous flagging when Inventory Level falls below Reorder Level, grouped by urgency.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border text-xs ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mb-1">Business Insights</div>
            <p className="text-slate-500 dark:text-slate-400 leading-normal">
              Auto-generated narrative identifying top/bottom regions, lagging stores, and categories with returns &gt;10%.
            </p>
          </div>
        </div>
      </div>

      {/* Schema Requirement Reference */}
      <div
        className={`max-w-4xl mx-auto rounded-xl border p-5 text-xs ${
          darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold flex items-center gap-1.5 text-slate-900 dark:text-white">
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
            <span>Supported Schema & Auto-Mapping Columns</span>
          </div>
          <span className="text-[11px] text-slate-400">Column names are matched flexibly</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          {schemaColumns.map((col) => (
            <div
              key={col.name}
              className={`p-2 rounded-lg border ${
                darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
              }`}
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">{col.name}</div>
              <div className="text-[10px] text-slate-400">{col.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
