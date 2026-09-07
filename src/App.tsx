import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_SAMPLE_DATA } from './data/sampleData';
import { FilterState, RetailRecord } from './types/retail';
import {
  calculateKPIs,
  getRegionalSales,
  getWeeklyTrends,
  getCategoryPerformance,
  getStoreLeaderboard,
  getStockoutRisks,
  generateAutomatedInsights,
  filterRecords,
  getUniqueFilterOptions,
} from './utils/analytics';
import { parseFiltersFromUrl } from './utils/exporter';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KPICards } from './components/KPICards';
import { WeeklySalesTrend } from './components/WeeklySalesTrend';
import { RegionalSalesChart } from './components/RegionalSalesChart';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';
import { StoreLeaderboard } from './components/StoreLeaderboard';
import { StockoutRiskSection } from './components/StockoutRiskSection';
import { BusinessInsightsPanel } from './components/BusinessInsightsPanel';
import { PrintExecutiveHeader } from './components/PrintExecutiveHeader';
import { EmptyStateView } from './components/EmptyStateView';
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';

export default function App() {
  // Theme state: default to clean light theme with dark mode option
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('retail_dashboard_theme');
      if (stored) return stored === 'dark';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('retail_dashboard_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Master records: default generic version with No sample data
  const [allRecords, setAllRecords] = useState<RetailRecord[]>([]);
  const [datasetName, setDatasetName] = useState<string>('');
  const [isSampleData, setIsSampleData] = useState<boolean>(false);

  // Global filters
  const initialUrlFilters = useMemo(() => parseFiltersFromUrl(), []);
  const [filters, setFilters] = useState<FilterState>({
    timePeriods: initialUrlFilters.timePeriods || [],
    regions: initialUrlFilters.regions || [],
    cities: initialUrlFilters.cities || [],
    stores: initialUrlFilters.stores || [],
    storeFormats: initialUrlFilters.storeFormats || [],
    categories: initialUrlFilters.categories || [],
    searchQuery: '',
  });

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Reset filters handler
  const handleResetFilters = () => {
    setFilters({
      timePeriods: [],
      regions: [],
      cities: [],
      stores: [],
      storeFormats: [],
      categories: [],
      searchQuery: '',
    });
    // Clean URL parameters
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.toString());
  };

  // Load sample dataset
  const handleLoadSampleData = () => {
    setAllRecords(INITIAL_SAMPLE_DATA);
    setDatasetName('Standard Enterprise Sample Dataset');
    setIsSampleData(true);
    handleResetFilters();
  };

  // Clear / Unload dataset back to generic homepage
  const handleClearData = () => {
    setAllRecords([]);
    setDatasetName('');
    setIsSampleData(false);
    handleResetFilters();
  };

  // Uploaded dataset handler
  const handleDataLoaded = (records: RetailRecord[], fileName: string) => {
    setAllRecords(records);
    setDatasetName(fileName);
    setIsSampleData(false);
    handleResetFilters();
  };

  // Filter options derived from current master records
  const filterOptions = useMemo(() => getUniqueFilterOptions(allRecords), [allRecords]);

  // Filtered dataset
  const filteredRecords = useMemo(() => filterRecords(allRecords, filters), [allRecords, filters]);

  // Analytical calculations
  const kpis = useMemo(() => calculateKPIs(filteredRecords), [filteredRecords]);
  const regionalSales = useMemo(() => getRegionalSales(filteredRecords), [filteredRecords]);
  const weeklyTrends = useMemo(() => getWeeklyTrends(filteredRecords), [filteredRecords]);
  const categoryPerf = useMemo(() => getCategoryPerformance(filteredRecords), [filteredRecords]);
  const storeLeaderboard = useMemo(() => getStoreLeaderboard(filteredRecords), [filteredRecords]);
  const stockoutRisks = useMemo(() => getStockoutRisks(filteredRecords), [filteredRecords]);
  const automatedInsights = useMemo(() => generateAutomatedInsights(filteredRecords), [filteredRecords]);

  // Interactive cross-filter callbacks from charts
  const handleSelectRegion = (region: string) => {
    setFilters((prev) => ({
      ...prev,
      regions: prev.regions.includes(region) ? prev.regions.filter((r) => r !== region) : [...prev.regions, region],
    }));
  };

  const handleSelectStore = (store: string) => {
    setFilters((prev) => ({
      ...prev,
      stores: prev.stores.includes(store) ? prev.stores.filter((s) => s !== store) : [store],
    }));
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/80 text-slate-900'
      }`}
    >
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLoadSampleData={handleLoadSampleData}
        onClearData={handleClearData}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        currentDatasetName={datasetName}
        isSampleData={isSampleData}
        records={filteredRecords}
        kpis={kpis}
        insights={automatedInsights}
        filters={filters}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {allRecords.length === 0 ? (
          <EmptyStateView
            onLoadSampleData={handleLoadSampleData}
            onDataLoaded={handleDataLoaded}
            darkMode={darkMode}
          />
        ) : (
          <div id="dashboard-printable-area" className="space-y-6">
            {/* Executive Print Header (Visible during PDF generation & @media print) */}
            <PrintExecutiveHeader
              kpis={kpis}
              filters={filters}
              datasetName={datasetName}
              recordsCount={filteredRecords.length}
            />

            {/* 1. Global Interactive Filters Bar */}
            <div className="pdf-section print-avoid-break">
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={handleResetFilters}
                options={filterOptions}
                totalCount={allRecords.length}
                filteredCount={filteredRecords.length}
                darkMode={darkMode}
              />
            </div>

            {/* 2. Top-Level KPI Summary Cards */}
            <div className="pdf-section print-avoid-break">
              <KPICards kpis={kpis} darkMode={darkMode} />
            </div>

            {/* 3. Primary Charts Row: Weekly Trend & Regional Sales */}
            <div className="pdf-section print-avoid-break grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <WeeklySalesTrend data={weeklyTrends} darkMode={darkMode} />
              </div>
              <div className="lg:col-span-5">
                <RegionalSalesChart
                  data={regionalSales}
                  darkMode={darkMode}
                  onSelectRegion={handleSelectRegion}
                />
              </div>
            </div>

            {/* 4. Secondary Analytics Row: Category Performance & Store Leaderboard */}
            <div className="pdf-section print-avoid-break grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <CategoryBreakdownChart data={categoryPerf} darkMode={darkMode} />
              </div>
              <div className="lg:col-span-6">
                <StoreLeaderboard
                  top10={storeLeaderboard.top10}
                  bottom10={storeLeaderboard.bottom10}
                  allStores={storeLeaderboard.allStores}
                  darkMode={darkMode}
                  onSelectStore={handleSelectStore}
                />
              </div>
            </div>

            {/* 5. Inventory & Stockout Risk Section */}
            <div className="pdf-section print-avoid-break">
              <StockoutRiskSection
                stockouts={stockoutRisks}
                darkMode={darkMode}
                onSelectStore={handleSelectStore}
              />
            </div>

            {/* 6. Automated Business Insight Summary Panel */}
            <div className="pdf-section print-avoid-break">
              <BusinessInsightsPanel
                insights={automatedInsights}
                kpis={kpis}
                recordCount={filteredRecords.length}
                filters={filters}
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs transition-colors ${
          darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Retail Sales Intelligence Dashboard • Production Ready</span>
          <span>Automatic Schema Mapping • Real-time Cross-filtering • Inventory Risk Alerts</span>
        </div>
      </footer>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
        darkMode={darkMode}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        filters={filters}
        darkMode={darkMode}
      />
    </div>
  );
}
