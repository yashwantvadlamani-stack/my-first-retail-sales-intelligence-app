import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CategoryPerformance } from '../types/retail';
import { Layers, AlertCircle } from 'lucide-react';

interface CategoryBreakdownChartProps {
  data: CategoryPerformance[];
  darkMode: boolean;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  data,
  darkMode,
}) => {
  const formatYAxis = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = data.find((d) => d.category === label);
      return (
        <div
          className={`p-3 rounded-xl shadow-xl border text-xs ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="font-semibold pb-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <span>{label}</span>
            {item && item.returnRate > 10 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Return Alert &gt;10%
              </span>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Net Sales:
              </span>
              <span className="font-semibold">${item?.netSales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Discounts:
              </span>
              <span className="text-amber-500 font-medium">
                ${item?.discountAmount.toLocaleString()} ({item?.discountRate.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Returns:
              </span>
              <span className="text-rose-500 font-medium">
                ${item?.returnAmount.toLocaleString()} ({item?.returnRate.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-200 dark:border-slate-800 font-medium">
              <span className="text-slate-600 dark:text-slate-300">Gross Merchandise Value:</span>
              <span className={darkMode ? 'text-white' : 'text-slate-900'}>${item?.grossSales.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="chart-category-performance-container"
      className={`p-5 rounded-xl border transition-all duration-200 ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Category Performance & Deductions
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
              Stacked Breakdown
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decomposition of Gross Sales into Net Sales, Promotional Discounts, and Returns
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 bg-blue-500 rounded-sm" />
            <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Net Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 bg-amber-500 rounded-sm" />
            <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Discounts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 bg-rose-500 rounded-sm" />
            <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Returns</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No category performance data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? '#334155' : '#f1f5f9'}
                vertical={false}
              />
              <XAxis
                dataKey="category"
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#334155' : '#e2e8f0' }}
                interval={0}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={14}
                      textAnchor="end"
                      fill={darkMode ? '#94a3b8' : '#64748b'}
                      transform="rotate(-25)"
                      fontSize={10}
                    >
                      {payload.value.length > 14 ? `${payload.value.substring(0, 13)}…` : payload.value}
                    </text>
                  </g>
                )}
              />
              <YAxis
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="netSales" name="Net Sales" stackId="a" fill="#3b82f6" />
              <Bar dataKey="discountAmount" name="Discounts" stackId="a" fill="#f59e0b" />
              <Bar dataKey="returnAmount" name="Returns" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
