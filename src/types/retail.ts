export interface RetailRecord {
  id: string;
  date: string; // DD-MM-YYYY
  week: string; // e.g. "Week 12" or "W12"
  region: string; // "North", "South", "East", "West", "Central"
  city: string;
  store: string; // e.g. "Store #101 - Downtown"
  storeFormat: 'Flagship' | 'Express' | 'Outlet' | string;
  productCategory: string; // "Apparel", "Electronics", "Home & Kitchen", etc.
  productName?: string;
  grossSales: number;
  netSales: number;
  targetSales: number;
  returnAmount: number;
  discountAmount: number;
  inventoryLevel: number;
  reorderLevel: number;
  ordersCount: number; // For ATV calculation
}

export interface FilterState {
  timePeriods: string[]; // Selected weeks or dates
  regions: string[];
  cities: string[];
  stores: string[];
  storeFormats: string[];
  categories: string[];
  searchQuery: string;
}

export interface KPIMetrics {
  totalNetSales: number;
  totalGrossSales: number;
  totalTargetSales: number;
  targetAchievement: number; // percentage (Net / Target * 100)
  atv: number; // Average Transaction Value = Net Sales / Orders
  returnRate: number; // (Return / Net) * 100
  discountRate: number; // (Discount / Gross) * 100
  totalOrders: number;
  totalReturnAmount: number;
  totalDiscountAmount: number;
  salesGap: number; // Net - Target (deficit if negative)
}

export interface RegionalSales {
  region: string;
  netSales: number;
  targetSales: number;
  achievement: number;
  grossSales: number;
  returnAmount: number;
  discountAmount: number;
  orderCount: number;
}

export interface WeeklyTrend {
  week: string; // DD-MM-YYYY
  date?: string; // DD-MM-YYYY
  displayDate?: string; // DD-MM-YYYY
  netSales: number;
  targetSales: number;
  grossSales: number;
  returns: number;
}

export interface CategoryPerformance {
  category: string;
  grossSales: number;
  netSales: number;
  discountAmount: number;
  returnAmount: number;
  returnRate: number; // return / net * 100
  discountRate: number; // discount / gross * 100
}

export interface StoreAchievement {
  store: string;
  region: string;
  city: string;
  format: string;
  netSales: number;
  targetSales: number;
  achievement: number;
  deficit: number; // targetSales - netSales (positive when missed)
}

export interface StockoutItem {
  id: string;
  store: string;
  region: string;
  category: string;
  productName: string;
  inventoryLevel: number;
  reorderLevel: number;
  deficitUnits: number; // reorderLevel - inventoryLevel
  urgency: 'Critical' | 'High' | 'Warning';
}

export interface AutomatedInsights {
  bestRegion: { name: string; sales: number; achievement: number };
  worstRegion: { name: string; sales: number; achievement: number };
  storesMissingTarget: { store: string; achievement: number; deficit: number; target: number; netSales: number }[];
  highReturnCategories: { category: string; returnRate: number; returnAmount: number; netSales: number }[];
  stockoutCount: number;
  criticalStockouts: StockoutItem[];
  executiveSummary: string;
  keyRecommendations: string[];
}
