import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { WeeklyTrend } from '../types/retail';
import { TrendingUp, HelpCircle } from 'lucide-react';
import { formatToDDMMYYYY } from '../utils/dateUtils';

interface WeeklySalesTrendProps {
  data: WeeklyTrend[];
  darkMode: boolean;
}

export const WeeklySalesTrend: React.FC<WeeklySalesTrendProps> = ({ data, darkMode }) => {
  const formatYAxis = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const netSales = payload.find((p: any) => p.dataKey === 'netSales')?.value || 0;
      const targetSales = payload.find((p: any) => p.dataKey === 'targetSales')?.value || 0;
      const achievement = targetSales > 0 ? (netSales / targetSales) * 100 : 0;
      const gap = netSales - targetSales;

      return (
        <div
          className={`p-3 rounded-xl shadow-xl border text-xs ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="font-semibold pb-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <span>{formatToDDMMYYYY(label)}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                achievement >= 100
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : achievement >= 90
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {achievement.toFixed(1)}% Achieved
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Net Sales:
              </span>
              <span className="font-semibold">${netSales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Target Sales:
              </span>
              <span className="font-medium text-slate-600 dark:text-slate-300">${targetSales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Variance:</span>
              <span className={`font-semibold ${gap >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {gap >= 0 ? `+$${gap.toLocaleString()}` : `-$${Math.abs(gap).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="chart-weekly-trend-container"
      className={`p-5 rounded-xl border transition-all duration-200 ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Weekly Sales Trend
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
              Net vs. Target
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Temporal trajectory tracking actual net sales against target pacing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-blue-500 rounded" />
              <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Net Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-400 border-dashed rounded" />
              <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Target</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No weekly trend data available for current filter selection.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? '#334155' : '#f1f5f9'}
                vertical={false}
              />
              <XAxis
                dataKey="week"
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickFormatter={(val) => formatToDDMMYYYY(val)}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#334155' : '#e2e8f0' }}
              />
              <YAxis
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="targetSales"
                name="Target Sales"
                stroke={darkMode ? '#94a3b8' : '#94a3b8'}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="netSales"
                name="Net Sales"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
