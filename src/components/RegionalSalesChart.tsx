import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { RegionalSales } from '../types/retail';
import { MapPin, ArrowUpDown } from 'lucide-react';

interface RegionalSalesChartProps {
  data: RegionalSales[];
  darkMode: boolean;
  onSelectRegion?: (region: string) => void;
}

export const RegionalSalesChart: React.FC<RegionalSalesChartProps> = ({
  data,
  darkMode,
  onSelectRegion,
}) => {
  const [sortBy, setSortBy] = useState<'sales' | 'achievement'>('sales');

  const sortedData = [...data].sort((a, b) =>
    sortBy === 'sales' ? b.netSales - a.netSales : b.achievement - a.achievement
  );

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: RegionalSales = payload[0].payload;
      return (
        <div
          className={`p-3 rounded-xl shadow-xl border text-xs ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="font-semibold pb-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              {item.region} Region
            </span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                item.achievement >= 100
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : item.achievement >= 90
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {item.achievement.toFixed(1)}% Achieved
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Net Sales:</span>
              <span className="font-semibold">${item.netSales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Target Quota:</span>
              <span className="text-slate-600 dark:text-slate-300">${item.targetSales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Gross Sales:</span>
              <span>${item.grossSales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Returns:</span>
              <span className="text-rose-500">${item.returnAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
              <span>Orders Logged:</span>
              <span>{item.orderCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (item: RegionalSales) => {
    if (item.achievement >= 100) return '#10b981'; // emerald-500
    if (item.achievement >= 90) return '#f59e0b'; // amber-500
    return '#f43f5e'; // rose-500
  };

  return (
    <div
      id="chart-regional-sales-container"
      className={`p-5 rounded-xl border transition-all duration-200 ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Sales by Region
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              Geographic Distribution
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Color-coded by Target Achievement (≥100% Green, 90–99% Amber, &lt;90% Red)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'sales' ? 'achievement' : 'sales')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span>Sort: {sortBy === 'sales' ? 'Net Volume' : 'Achievement %'}</span>
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {sortedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No regional sales data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? '#334155' : '#f1f5f9'}
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#334155' : '#e2e8f0' }}
              />
              <YAxis
                type="category"
                dataKey="region"
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="netSales"
                name="Net Sales"
                radius={[0, 6, 6, 0]}
                barSize={20}
                onClick={(entry: any) => onSelectRegion && onSelectRegion(entry.region)}
                className="cursor-pointer"
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
