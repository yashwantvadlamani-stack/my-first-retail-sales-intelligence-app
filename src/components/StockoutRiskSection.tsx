import React, { useState } from 'react';
import { StockoutItem } from '../types/retail';
import { AlertOctagon, AlertTriangle, ShieldAlert, Package, Search, ArrowDownRight } from 'lucide-react';

interface StockoutRiskSectionProps {
  stockouts: StockoutItem[];
  darkMode: boolean;
  onSelectStore?: (store: string) => void;
}

export const StockoutRiskSection: React.FC<StockoutRiskSectionProps> = ({
  stockouts,
  darkMode,
  onSelectStore,
}) => {
  const [filterUrgency, setFilterUrgency] = useState<'ALL' | 'Critical' | 'High' | 'Warning'>('ALL');
  const [search, setSearch] = useState('');

  const filteredStockouts = stockouts.filter((item) => {
    if (filterUrgency !== 'ALL' && item.urgency !== filterUrgency) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.store.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = stockouts.filter((s) => s.urgency === 'Critical').length;
  const highCount = stockouts.filter((s) => s.urgency === 'High').length;
  const warningCount = stockouts.filter((s) => s.urgency === 'Warning').length;
  const totalDeficitUnits = stockouts.reduce((acc, s) => acc + s.deficitUnits, 0);

  const getUrgencyBadge = (urgency: 'Critical' | 'High' | 'Warning') => {
    switch (urgency) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
            <AlertOctagon className="w-3 h-3 text-rose-500" />
            Critical Stockout
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium border border-orange-500/20">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            High Risk
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
            <ShieldAlert className="w-3 h-3 text-amber-500" />
            Reorder Alert
          </span>
        );
    }
  };

  return (
    <div
      id="stockout-risk-section-container"
      className={`p-5 rounded-xl border transition-all duration-200 ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Stockout Risk & Inventory Replenishment Alert
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
              Inventory ≤ Reorder Level
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify SKUs experiencing stock depletion below safety thresholds to prevent revenue loss
          </p>
        </div>

        {/* Quick status counters */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilterUrgency('ALL')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              filterUrgency === 'ALL'
                ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-medium'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Alerts ({stockouts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterUrgency('Critical')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
              filterUrgency === 'Critical'
                ? 'bg-rose-600 text-white font-medium'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterUrgency('High')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
              filterUrgency === 'High'
                ? 'bg-orange-600 text-white font-medium'
                : 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400'
            }`}
          >
            High ({highCount})
          </button>
        </div>
      </div>

      {/* Mini summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className={`p-3 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">At-Risk Items</div>
          <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stockouts.length}</div>
        </div>
        <div className={`p-3 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Deficit Units</div>
          <div className="text-lg font-bold text-rose-500">{totalDeficitUnits} units</div>
        </div>
        <div className={`p-3 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Critical Stockouts</div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{criticalCount}</div>
        </div>
        <div className={`p-3 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Moderate / Reorder</div>
          <div className="text-lg font-bold text-amber-500">{highCount + warningCount}</div>
        </div>
      </div>

      {/* Search within stockouts */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter at-risk product or store location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border transition-colors outline-none ${
            darkMode
              ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-rose-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-rose-500'
          }`}
        />
      </div>

      {/* Stockout Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              className={`border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold ${
                darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <th className="py-2.5 px-3">Product / SKU</th>
              <th className="py-2.5 px-3">Store & Region</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Current Stock</th>
              <th className="py-2.5 px-3 text-right">Reorder Level</th>
              <th className="py-2.5 px-3 text-right">Deficit</th>
              <th className="py-2.5 px-3 text-center">Urgency Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredStockouts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No stockout alerts found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredStockouts.map((item) => (
                <tr
                  key={item.id + item.store + item.productName}
                  className={`transition-colors ${
                    darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.productName}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => onSelectStore && onSelectStore(item.store)}
                      className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                    >
                      {item.store}
                    </button>
                    <div className="text-[10px] text-slate-400">{item.region} Region</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{item.category}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    <span className={item.inventoryLevel === 0 ? 'text-rose-500 font-bold' : ''}>
                      {item.inventoryLevel} units
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">
                    {item.reorderLevel} units
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-bold text-rose-500">
                      -{item.deficitUnits}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">{getUrgencyBadge(item.urgency)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
