import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, Table } from 'lucide-react';
import { parseFile, convertRawDataToRecords, ColumnMapping } from '../utils/parser';
import { RetailRecord } from '../types/retail';
import * as XLSX from 'xlsx';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (records: RetailRecord[], fileName: string) => void;
  darkMode: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  darkMode,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Staged file state
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
        throw new Error('Please upload a valid .csv or .xlsx / .xls spreadsheet.');
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Spreadsheet has no readable sheets.');
      }
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      if (json.length === 0) {
        throw new Error('The uploaded file has no data rows.');
      }

      const result = await parseFile(file);
      setFileName(file.name);
      setHeaders(result.headers);
      setMapping(result.detectedMapping);
      setRawRows(json);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file. Please verify format.');
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

  const handleConfirmMappingAndLoad = () => {
    if (!mapping || rawRows.length === 0) return;
    try {
      const records = convertRawDataToRecords(rawRows, mapping);
      onDataLoaded(records, fileName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to convert records.');
    }
  };

  const handleReset = () => {
    setFileName('');
    setHeaders([]);
    setMapping(null);
    setRawRows([]);
    setError(null);
  };

  const requiredFields: { key: keyof ColumnMapping; label: string; desc: string }[] = [
    { key: 'date', label: 'Date / Transaction Date', desc: 'Date formatted as DD-MM-YYYY (e.g. 15-01-2026)' },
    { key: 'week', label: 'Week / Fiscal Period', desc: 'e.g. Week 01, Week 12' },
    { key: 'region', label: 'Region / Territory', desc: 'North, South, East, West, Central' },
    { key: 'city', label: 'City / Market', desc: 'Store city location' },
    { key: 'store', label: 'Store Name / Branch', desc: 'Unique retail store location' },
    { key: 'storeFormat', label: 'Store Format', desc: 'Flagship, Express, Outlet' },
    { key: 'productCategory', label: 'Product Category', desc: 'Apparel, Electronics, Footwear...' },
    { key: 'grossSales', label: 'Gross Sales ($)', desc: 'Total sales before markdowns' },
    { key: 'netSales', label: 'Net Sales ($)', desc: 'Actual realized revenue' },
    { key: 'targetSales', label: 'Target / Quota Sales ($)', desc: 'Sales quota for period' },
    { key: 'returnAmount', label: 'Return Amount ($)', desc: 'Customer refunds and returns' },
    { key: 'discountAmount', label: 'Discount Amount ($)', desc: 'Promotional markdowns' },
    { key: 'inventoryLevel', label: 'Inventory Level', desc: 'Current units on hand' },
    { key: 'reorderLevel', label: 'Reorder Level', desc: 'Safety stock threshold' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="upload-dataset-modal"
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Upload Retail Dataset</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports .csv and .xlsx files with automatic column schema mapping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!mapping ? (
            /* Upload Dropzone */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/5 scale-[0.99]'
                  : darkMode
                  ? 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
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
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {loading ? 'Processing File...' : 'Drag & drop your CSV or Excel file here'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Or click to browse from your computer. We will automatically parse columns and calculate metrics.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800">.CSV</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800">.XLSX</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800">.XLS</span>
              </div>
            </div>
          ) : (
            /* Schema Mapping Confirmation */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>
                    Successfully parsed <strong>{rawRows.length} rows</strong> from <strong>{fileName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs underline font-medium hover:text-blue-900 dark:hover:text-white"
                >
                  Change File
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-blue-500" />
                  Schema Auto-Mapping Verification:
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Verify or adjust how columns in your spreadsheet map to the retail analytics schema:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {requiredFields.map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border text-xs ${
                        darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                        {mapping[key] ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                            Mapped
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 font-medium">
                            Auto-Fill
                          </span>
                        )}
                      </div>
                      <select
                        aria-label={`Map column for ${label}`}
                        value={mapping[key] || ''}
                        onChange={(e) =>
                          setMapping((prev) => (prev ? { ...prev, [key]: e.target.value } : null))
                        }
                        className={`w-full text-xs rounded-md border p-1.5 outline-none ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-slate-200'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="">-- Fallback / Auto-Generate --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 text-[10px] text-slate-400">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          {mapping && (
            <button
              type="button"
              id="btn-confirm-load-dataset"
              onClick={handleConfirmMappingAndLoad}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <span>Load Into Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
