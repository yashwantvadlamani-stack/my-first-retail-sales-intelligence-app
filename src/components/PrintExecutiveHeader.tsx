import React from 'react';
import { KPIMetrics, FilterState } from '../types/retail';
import { formatToDDMMYYYY } from '../utils/dateUtils';
import { BarChart3, Calendar, Database, Filter, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface PrintExecutiveHeaderProps {
  kpis: KPIMetrics;
  filters: FilterState;
  datasetName: string;
  recordsCount: number;
  forceVisible?: boolean;
}

export const PrintExecutiveHeader: React.FC<PrintExecutiveHeaderProps> = ({
  kpis,
  filters,
  datasetName,
  recordsCount,
  forceVisible = false,
}) => {
  const currentDate = new Date();
  const dateFormatted = formatToDDMMYYYY(currentDate);
  const timeFormatted = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Format active filters string
  const filterParts: string[] = [];
  if (filters.timePeriods.length > 0) {
    filterParts.push(`Weeks: ${filters.timePeriods.join(', ')}`);
  }
  if (filters.regions.length > 0) {
    filterParts.push(`Regions: ${filters.regions.join(', ')}`);
  }
  if (filters.cities.length > 0) {
    filterParts.push(`Cities: ${filters.cities.join(', ')}`);
  }
  if (filters.stores.length > 0) {
    filterParts.push(`Stores: ${filters.stores.join(', ')}`);
  }
  if (filters.storeFormats.length > 0) {
    filterParts.push(`Formats: ${filters.storeFormats.join(', ')}`);
  }
  if (filters.categories.length > 0) {
    filterParts.push(`Categories: ${filters.categories.join(', ')}`);
  }
  if (filters.searchQuery) {
    filterParts.push(`Search: "${filters.searchQuery}"`);
  }

  const filterSummary = filterParts.length > 0 ? filterParts.join(' • ') : 'All Data (No Filters Applied)';

  return (
    <div
      id="print-executive-header"
      className={`${forceVisible ? 'block' : 'hidden'} print:block mb-6 p-5 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-xs`}
    >
      <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Retail Sales Intelligence
              </h1>
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Executive Print Edition
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Comprehensive Multi-Store Performance, Category Contribution & Operational Risk Report
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-600 space-y-0.5">
          <div className="flex items-center justify-end gap-1.5 font-medium text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Generated: {dateFormatted} at {timeFormatted}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Dataset: {datasetName || 'Retail Analytics'} ({recordsCount.toLocaleString()} transactions)</span>
          </div>
        </div>
      </div>

      {/* Scope & High-level status bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Net Sales</span>
          <span className="text-base font-bold text-slate-900">
            ${kpis.totalNetSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Target Quota</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-slate-900">
              {kpis.targetAchievement.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-600">
              (${kpis.totalTargetSales.toLocaleString()})
            </span>
          </div>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Target Status</span>
          <div className="flex items-center gap-1 mt-0.5">
            {kpis.targetAchievement >= 100 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">Quota Achieved</span>
              </>
            ) : kpis.targetAchievement >= 90 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-amber-700">Within 10% Quota</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-semibold text-rose-700">Underperforming</span>
              </>
            )}
          </div>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Return & Discount Rates</span>
          <span className="text-xs font-semibold text-slate-800">
            Returns: {kpis.returnRate.toFixed(1)}% • Markdown: {kpis.discountRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Filter Scope Tag */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-medium text-slate-700 shrink-0">Active Scope:</span>
        <span className="text-slate-600 truncate">{filterSummary}</span>
      </div>
    </div>
  );
};
