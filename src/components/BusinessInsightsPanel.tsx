import React, { useState } from 'react';
import { AutomatedInsights, KPIMetrics, FilterState } from '../types/retail';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Copy,
  Check,
  FileText,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { exportInsightsToMarkdown, printExecutiveReport } from '../utils/exporter';

interface BusinessInsightsPanelProps {
  insights: AutomatedInsights;
  kpis: KPIMetrics;
  recordCount: number;
  filters: FilterState;
  darkMode: boolean;
}

export const BusinessInsightsPanel: React.FC<BusinessInsightsPanelProps> = ({
  insights,
  kpis,
  recordCount,
  filters,
  darkMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'deficits' | 'returns'>('overview');

  const handleCopyNarrative = () => {
    navigator.clipboard.writeText(insights.executiveSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    exportInsightsToMarkdown(kpis, insights, recordCount, filters);
  };

  return (
    <div
      id="automated-business-insights-panel"
      className={`rounded-xl border p-5 transition-all duration-200 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header with action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Automated Business Insight Summary
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                Live Dynamic Synthesis
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Autonomous narrative diagnosing performance drivers, margin leakages, and quota shortfalls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyNarrative}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Insights (.md)</span>
          </button>
        </div>
      </div>

      {/* Narrative Executive Summary Box */}
      <div
        className={`mt-4 p-4 rounded-xl border leading-relaxed text-xs sm:text-sm font-normal ${
          darkMode
            ? 'bg-slate-800/40 border-slate-700/80 text-slate-200'
            : 'bg-slate-50 border-slate-200/80 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 mb-2 font-semibold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Compass className="w-3.5 h-3.5" />
          Executive Performance Briefing
        </div>
        <p className="text-xs sm:text-sm leading-relaxed">{insights.executiveSummary}</p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Key Recommendations ({insights.keyRecommendations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('regions')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'regions'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Regional Extremes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('deficits')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'deficits'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Stores Missing Target ({insights.storesMissingTarget.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'returns'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          High-Return Categories ({insights.highReturnCategories.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {/* 1. Key Recommendations Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-2.5">
            {insights.keyRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="mt-0.5 p-1 rounded-md bg-emerald-500/10 text-emerald-600 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 leading-normal text-slate-700 dark:text-slate-300">
                  {rec}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Regional Extremes Tab */}
        {activeTab === 'regions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Best Performing Region */}
            <div
              className={`p-4 rounded-xl border ${
                darkMode ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Best Performing Region
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Top Growth Anchor
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {insights.bestRegion.name} Region
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Net Sales Volume:</span>
                  <strong className="text-slate-900 dark:text-white">
                    ${insights.bestRegion.sales.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Target Achievement:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {insights.bestRegion.achievement.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Worst Performing Region */}
            <div
              className={`p-4 rounded-xl border ${
                darkMode ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50/70 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  Worst Performing Region
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold">
                  Lagging Region
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {insights.worstRegion.name} Region
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Net Sales Volume:</span>
                  <strong className="text-slate-900 dark:text-white">
                    ${insights.worstRegion.sales.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Target Achievement:</span>
                  <strong className="text-rose-600 dark:text-rose-400 font-bold">
                    {insights.worstRegion.achievement.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Stores Missing Target Tab */}
        {activeTab === 'deficits' && (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-xs">
            {insights.storesMissingTarget.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                Great news! All store locations currently achieve or surpass 100% of their target.
              </div>
            ) : (
              insights.storesMissingTarget.map((store, i) => (
                <div
                  key={store.store}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                    darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-500 font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{store.store}</div>
                      <div className="text-[11px] text-slate-400">
                        Net: ${store.netSales.toLocaleString()} vs. Quota: ${store.target.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-rose-500">
                      -${store.deficit.toLocaleString()} deficit
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {store.achievement.toFixed(1)}% of Target
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. High Return Categories Tab */}
        {activeTab === 'returns' && (
          <div className="space-y-2 text-xs">
            {insights.highReturnCategories.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                No product category exceeds the 10.0% return rate ceiling.
              </div>
            ) : (
              insights.highReturnCategories.map((cat, i) => (
                <div
                  key={cat.category}
                  className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 ${
                    darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{cat.category}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold">
                          Return Alert &gt;10%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Total Refunded: ${cat.returnAmount.toLocaleString()} against ${cat.netSales.toLocaleString()} net sales
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-rose-500">
                      {cat.returnRate.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-400">Return Rate</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
