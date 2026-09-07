import React, { useState } from 'react';
import { DollarSign, Target, ShoppingBag, RotateCcw, Percent, HelpCircle, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { KPIMetrics } from '../types/retail';

interface KPICardsProps {
  kpis: KPIMetrics;
  darkMode: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, darkMode }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(val) >= 1_000) {
      return `$${(val / 1_000).toFixed(1)}K`;
    }
    return `$${val.toFixed(2)}`;
  };

  // Target Achievement Color Status: Green >= 100%, Yellow 90–99%, Red < 90%
  const getAchievementStatus = (rate: number) => {
    if (rate >= 100) {
      return {
        label: 'Target Exceeded',
        colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
        barColor: 'bg-emerald-500',
        icon: TrendingUp,
      };
    }
    if (rate >= 90) {
      return {
        label: 'Near Target (90–99%)',
        colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
        barColor: 'bg-amber-500',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'Target Missed (<90%)',
      colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20 dark:text-rose-400',
      barColor: 'bg-rose-500',
      icon: TrendingDown,
    };
  };

  const achievementStatus = getAchievementStatus(kpis.targetAchievement);
  const AchIcon = achievementStatus.icon;

  // Return Rate Color: Green <= 10%, Red > 10%
  const isHighReturn = kpis.returnRate > 10;

  return (
    <section id="kpi-summary-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Net Sales Card */}
      <div
        id="card-net-sales"
        className={`relative p-5 rounded-xl border transition-all duration-200 ${
          darkMode
            ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Net Sales
          </span>
          <div className="flex items-center gap-1.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="relative">
              <button
                type="button"
                aria-label="Net Sales information"
                onMouseEnter={() => setActiveTooltip('netSales')}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'netSales' && (
                <div className="absolute right-0 z-50 w-60 p-2.5 text-xs rounded-lg shadow-xl bg-slate-900 text-slate-100 border border-slate-700 bottom-full mb-2 pointer-events-none">
                  Total revenue realized after deductions for promotional discounts and item returns.
                  <div className="mt-1 text-[11px] text-slate-400">Formula: Gross Sales - (Discounts + Returns)</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {formatCurrency(kpis.totalNetSales)}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Gross: {formatCurrency(kpis.totalGrossSales)}</span>
          <span className={`font-medium ${kpis.salesGap >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {kpis.salesGap >= 0 ? `+${formatCurrency(kpis.salesGap)} surplus` : `${formatCurrency(kpis.salesGap)} deficit`}
          </span>
        </div>
      </div>

      {/* 2. Target Achievement (%) */}
      <div
        id="card-target-achievement"
        className={`relative p-5 rounded-xl border transition-all duration-200 ${
          darkMode
            ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Target Achievement
          </span>
          <div className="flex items-center gap-1.5">
            <div className={`p-2 rounded-lg ${achievementStatus.colorClass}`}>
              <Target className="w-4 h-4" />
            </div>
            <div className="relative">
              <button
                type="button"
                aria-label="Target Achievement information"
                onMouseEnter={() => setActiveTooltip('target')}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'target' && (
                <div className="absolute right-0 z-50 w-60 p-2.5 text-xs rounded-lg shadow-xl bg-slate-900 text-slate-100 border border-slate-700 bottom-full mb-2 pointer-events-none">
                  Percentage of revenue quota attained.
                  <div className="mt-1 text-[11px] text-slate-400">Green: ≥100% | Yellow: 90–99% | Red: &lt;90%</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {kpis.targetAchievement.toFixed(1)}%
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${achievementStatus.colorClass}`}>
            <AchIcon className="w-3 h-3" />
            {achievementStatus.label}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${achievementStatus.barColor}`}
            style={{ width: `${Math.min(100, kpis.targetAchievement)}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Target: {formatCurrency(kpis.totalTargetSales)}</span>
          <span>Goal: 100%</span>
        </div>
      </div>

      {/* 3. Average Transaction Value (ATV) */}
      <div
        id="card-atv"
        className={`relative p-5 rounded-xl border transition-all duration-200 ${
          darkMode
            ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Avg Transaction (ATV)
          </span>
          <div className="flex items-center gap-1.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="relative">
              <button
                type="button"
                aria-label="Average Transaction Value information"
                onMouseEnter={() => setActiveTooltip('atv')}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'atv' && (
                <div className="absolute right-0 z-50 w-60 p-2.5 text-xs rounded-lg shadow-xl bg-slate-900 text-slate-100 border border-slate-700 bottom-full mb-2 pointer-events-none">
                  Average spend per customer order or checkout.
                  <div className="mt-1 text-[11px] text-slate-400">Formula: Net Sales ÷ Total Orders</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            ${kpis.atv.toFixed(2)}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{kpis.totalOrders.toLocaleString()} Total Orders</span>
          <span className="text-indigo-500 font-medium">Retail Basket</span>
        </div>
      </div>

      {/* 4. Return Rate (%) */}
      <div
        id="card-return-rate"
        className={`relative p-5 rounded-xl border transition-all duration-200 ${
          darkMode
            ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Return Rate
          </span>
          <div className="flex items-center gap-1.5">
            <div
              className={`p-2 rounded-lg ${
                isHighReturn
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="relative">
              <button
                type="button"
                aria-label="Return Rate information"
                onMouseEnter={() => setActiveTooltip('returnRate')}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'returnRate' && (
                <div className="absolute right-0 z-50 w-60 p-2.5 text-xs rounded-lg shadow-xl bg-slate-900 text-slate-100 border border-slate-700 bottom-full mb-2 pointer-events-none">
                  Percentage of sales value returned by consumers.
                  <div className="mt-1 text-[11px] text-slate-400">Formula: (Return Amount ÷ Net Sales) × 100. Alert threshold &gt;10%.</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {kpis.returnRate.toFixed(1)}%
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full border ${
              isHighReturn
                ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
            }`}
          >
            {isHighReturn ? 'High (>10%)' : 'Healthy (≤10%)'}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Refunded: {formatCurrency(kpis.totalReturnAmount)}</span>
          <span>Cap: 10%</span>
        </div>
      </div>

      {/* 5. Discount Rate (%) */}
      <div
        id="card-discount-rate"
        className={`relative p-5 rounded-xl border transition-all duration-200 ${
          darkMode
            ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Discount Rate
          </span>
          <div className="flex items-center gap-1.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Percent className="w-4 h-4" />
            </div>
            <div className="relative">
              <button
                type="button"
                aria-label="Discount Rate information"
                onMouseEnter={() => setActiveTooltip('discountRate')}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'discountRate' && (
                <div className="absolute right-0 z-50 w-60 p-2.5 text-xs rounded-lg shadow-xl bg-slate-900 text-slate-100 border border-slate-700 bottom-full mb-2 pointer-events-none">
                  Promotional markdown proportion against gross merchandise value.
                  <div className="mt-1 text-[11px] text-slate-400">Formula: (Discount Amount ÷ Gross Sales) × 100</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {kpis.discountRate.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Markdowns: {formatCurrency(kpis.totalDiscountAmount)}</span>
          <span className="text-amber-500 font-medium">Margin Impact</span>
        </div>
      </div>
    </section>
  );
};
