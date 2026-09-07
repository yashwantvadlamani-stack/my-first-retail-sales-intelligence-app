import React, { useState } from 'react';
import { StoreAchievement } from '../types/retail';
import { Award, AlertTriangle, TrendingUp, TrendingDown, Store as StoreIcon } from 'lucide-react';

interface StoreLeaderboardProps {
  top10: StoreAchievement[];
  bottom10: StoreAchievement[];
  allStores: StoreAchievement[];
  darkMode: boolean;
  onSelectStore?: (store: string) => void;
}

export const StoreLeaderboard: React.FC<StoreLeaderboardProps> = ({
  top10,
  bottom10,
  allStores,
  darkMode,
  onSelectStore,
}) => {
  const [tab, setTab] = useState<'top' | 'bottom'>('top');

  const currentList = tab === 'top' ? top10 : bottom10;

  const getStatus = (ach: number) => {
    if (ach >= 100) {
      return {
        color: 'text-emerald-500',
        bg: 'bg-emerald-500',
        border: 'border-emerald-500/20',
        badgeBg: 'bg-emerald-500/10 text-emerald-500',
        label: 'Surplus',
      };
    }
    if (ach >= 90) {
      return {
        color: 'text-amber-500',
        bg: 'bg-amber-500',
        border: 'border-amber-500/20',
        badgeBg: 'bg-amber-500/10 text-amber-500',
        label: 'Near Target',
      };
    }
    return {
      color: 'text-rose-500',
      bg: 'bg-rose-500',
      border: 'border-rose-500/20',
      badgeBg: 'bg-rose-500/10 text-rose-500',
      label: 'Deficit',
    };
  };

  return (
    <div
      id="store-leaderboard-container"
      className={`p-5 rounded-xl border transition-all duration-200 ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Store Performance Leaderboard
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
              Ranked by Achievement
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare highest exceeding stores versus locations lagging behind their quota
          </p>
        </div>

        {/* Toggle buttons for Top 10 vs Bottom 10 */}
        <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            id="btn-tab-top-10"
            onClick={() => setTab('top')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              tab === 'top'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Top 10 Achievers</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600">
              {top10.length}
            </span>
          </button>
          <button
            type="button"
            id="btn-tab-bottom-10"
            onClick={() => setTab('bottom')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              tab === 'bottom'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Bottom 10 Laggers</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600">
              {bottom10.length}
            </span>
          </button>
        </div>
      </div>

      {/* Stores List */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {currentList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No store performance records found for current filters.
          </div>
        ) : (
          currentList.map((item, idx) => {
            const st = getStatus(item.achievement);
            const rank = idx + 1;
            const barWidth = Math.min(100, (item.achievement / 150) * 100);

            return (
              <div
                key={item.store}
                onClick={() => onSelectStore && onSelectStore(item.store)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                        tab === 'top' && rank <= 3
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : darkMode
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rank}
                    </span>
                    <span className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {item.store}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                      {item.format}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 hidden sm:inline">
                      {item.city}, {item.region}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`font-bold text-sm ${st.color}`}>
                        {item.achievement.toFixed(1)}%
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.badgeBg} ${st.border}`}>
                      {item.achievement >= 100
                        ? `+$${((item.netSales - item.targetSales) / 1000).toFixed(1)}K`
                        : `-$${(item.deficit / 1000).toFixed(1)}K`}
                    </span>
                  </div>
                </div>

                {/* Progress bar representing achievement */}
                <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${st.bg}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Net Sales: ${item.netSales.toLocaleString()}</span>
                  <span>Target: ${item.targetSales.toLocaleString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
