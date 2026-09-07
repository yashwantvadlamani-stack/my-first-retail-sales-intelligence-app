import React, { useState } from 'react';
import { Filter, X, Search, ChevronDown, Calendar, MapPin, Store, Tag, RefreshCw } from 'lucide-react';
import { FilterState } from '../types/retail';
import { formatToDDMMYYYY } from '../utils/dateUtils';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onResetFilters: () => void;
  options: {
    weeks: string[];
    regions: string[];
    cities: string[];
    stores: string[];
    storeFormats: string[];
    categories: string[];
  };
  totalCount: number;
  filteredCount: number;
  darkMode: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  options,
  totalCount,
  filteredCount,
  darkMode,
}) => {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  const activeFiltersCount =
    filters.timePeriods.length +
    filters.regions.length +
    filters.cities.length +
    filters.stores.length +
    filters.storeFormats.length +
    filters.categories.length +
    (filters.searchQuery ? 1 : 0);

  const handleSelectToggle = (field: keyof FilterState, val: string) => {
    onFilterChange((prev) => {
      const currentArr = (prev[field] as string[]) || [];
      if (currentArr.includes(val)) {
        return { ...prev, [field]: currentArr.filter((item) => item !== val) };
      } else {
        return { ...prev, [field]: [...currentArr, val] };
      }
    });
  };

  const handleSingleSelect = (field: keyof FilterState, val: string) => {
    onFilterChange((prev) => {
      if (val === '__ALL__') {
        return { ...prev, [field]: [] };
      }
      return { ...prev, [field]: [val] };
    });
  };

  // Helper for single dropdown selects
  const getSelectedValue = (arr: string[]) => {
    if (arr.length === 0) return '__ALL__';
    if (arr.length === 1) return arr[0];
    return 'MULTIPLE';
  };

  return (
    <div
      id="global-filters-container"
      className={`rounded-xl border p-4 transition-all duration-200 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-sm text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>Interactive Global Filters</span>
          </div>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {activeFiltersCount} active
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
            Showing <strong className="font-semibold text-slate-700 dark:text-slate-300">{filteredCount}</strong> of {totalCount} records
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Print badge for active search query */}
          {filters.searchQuery && (
            <span className="hidden print:inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 border border-slate-300 text-slate-700">
              Search: "{filters.searchQuery}"
            </span>
          )}

          {/* Search box */}
          <div className="relative no-print">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Search store, city, SKU..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border transition-colors outline-none w-48 sm:w-60 ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
              }`}
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters button */}
          <button
            id="btn-clear-all-filters"
            type="button"
            onClick={onResetFilters}
            disabled={activeFiltersCount === 0}
            className={`no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              activeFiltersCount === 0
                ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                : 'border-rose-500/20 text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 dark:text-rose-400'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear All Filters</span>
          </button>

          {/* Mobile expand toggle */}
          <button
            type="button"
            onClick={() => setIsExpandedMobile(!isExpandedMobile)}
            className="no-print md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpandedMobile ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className={`mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 ${isExpandedMobile ? 'block' : 'hidden md:grid'}`}>
        {/* 1. Time Period (Week) */}
        <div id="filter-week" className="flex flex-col gap-1">
          <label htmlFor="select-filter-week" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-500" />
            <span>Week / Period</span>
          </label>
          <select
            id="select-filter-week"
            aria-label="Filter by week or period"
            value={getSelectedValue(filters.timePeriods)}
            onChange={(e) => handleSingleSelect('timePeriods', e.target.value)}
            className={`w-full text-xs rounded-lg border p-2 outline-none cursor-pointer ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="__ALL__">All Weeks ({options.weeks.length})</option>
            {options.weeks.map((wk) => (
              <option key={wk} value={wk}>
                {formatToDDMMYYYY(wk)}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Region */}
        <div id="filter-region" className="flex flex-col gap-1">
          <label htmlFor="select-filter-region" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span>Region</span>
          </label>
          <select
            id="select-filter-region"
            aria-label="Filter by region"
            value={getSelectedValue(filters.regions)}
            onChange={(e) => handleSingleSelect('regions', e.target.value)}
            className={`w-full text-xs rounded-lg border p-2 outline-none cursor-pointer ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="__ALL__">All Regions ({options.regions.length})</option>
            {options.regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg} Region
              </option>
            ))}
          </select>
        </div>

        {/* 3. City */}
        <div id="filter-city" className="flex flex-col gap-1">
          <label htmlFor="select-filter-city" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-teal-500" />
            <span>City / Market</span>
          </label>
          <select
            id="select-filter-city"
            aria-label="Filter by city or market"
            value={getSelectedValue(filters.cities)}
            onChange={(e) => handleSingleSelect('cities', e.target.value)}
            className={`w-full text-xs rounded-lg border p-2 outline-none cursor-pointer ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="__ALL__">All Cities ({options.cities.length})</option>
            {options.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Store Format */}
        <div id="filter-store-format" className="flex flex-col gap-1">
          <label htmlFor="select-filter-format" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Store className="w-3 h-3 text-purple-500" />
            <span>Store Format</span>
          </label>
          <select
            id="select-filter-format"
            aria-label="Filter by store format"
            value={getSelectedValue(filters.storeFormats)}
            onChange={(e) => handleSingleSelect('storeFormats', e.target.value)}
            className={`w-full text-xs rounded-lg border p-2 outline-none cursor-pointer ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="__ALL__">All Formats ({options.storeFormats.length})</option>
            {options.storeFormats.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Store */}
        <div id="filter-store" className="flex flex-col gap-1">
          <label htmlFor="select-filter-store" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Store className="w-3 h-3 text-indigo-500" />
            <span>Store Location</span>
          </label>
          <select
            id="select-filter-store"
            aria-label="Filter by store location"
            value={getSelectedValue(filters.stores)}
            onChange={(e) => handleSingleSelect('stores', e.target.value)}
            className={`w-full text-xs rounded-lg border p-2 outline-none cursor-pointer truncate ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="__ALL__">All Stores ({options.stores.length})</option>
            {options.stores.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Product Category */}
        <div id="filter-category" className="flex flex-col gap-1">
          <label htmlFor="select-filter-category" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3 text-pink-500" />
            <span>Product Category</span>
          </label>
          <select
            id="select-filter-category"
            aria-label="Filter by product category"
            value={getSelectedValue(filters.categories)}
            onChange={(e) => handleSingleSelect('categories', e.target.value)}
            className={`w-full text-xs rounded-lg border p-2 outline-none cursor-pointer truncate ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="__ALL__">All Categories ({options.categories.length})</option>
            {options.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Tags Row (if any selected) */}
      {activeFiltersCount > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium">Filtered by:</span>
          {filters.timePeriods.map((wk) => (
            <span
              key={wk}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
            >
              {wk}
              <button
                type="button"
                aria-label={`Remove filter ${wk}`}
                onClick={() => handleSelectToggle('timePeriods', wk)}
                className="hover:text-blue-800 dark:hover:text-blue-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.regions.map((reg) => (
            <span
              key={reg}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            >
              {reg}
              <button
                type="button"
                aria-label={`Remove filter ${reg}`}
                onClick={() => handleSelectToggle('regions', reg)}
                className="hover:text-emerald-800 dark:hover:text-emerald-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.cities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
            >
              {city}
              <button
                type="button"
                aria-label={`Remove filter ${city}`}
                onClick={() => handleSelectToggle('cities', city)}
                className="hover:text-teal-800 dark:hover:text-teal-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.storeFormats.map((fmt) => (
            <span
              key={fmt}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
            >
              {fmt}
              <button
                type="button"
                aria-label={`Remove filter ${fmt}`}
                onClick={() => handleSelectToggle('storeFormats', fmt)}
                className="hover:text-purple-800 dark:hover:text-purple-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.stores.map((st) => (
            <span
              key={st}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
            >
              {st}
              <button
                type="button"
                aria-label={`Remove filter ${st}`}
                onClick={() => handleSelectToggle('stores', st)}
                className="hover:text-indigo-800 dark:hover:text-indigo-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20"
            >
              {cat}
              <button
                type="button"
                aria-label={`Remove filter ${cat}`}
                onClick={() => handleSelectToggle('categories', cat)}
                className="hover:text-pink-800 dark:hover:text-pink-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20">
              Query: &quot;{filters.searchQuery}&quot;
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => onFilterChange((prev) => ({ ...prev, searchQuery: '' }))}
                className="hover:text-slate-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
