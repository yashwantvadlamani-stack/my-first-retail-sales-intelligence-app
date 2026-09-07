import {
  RetailRecord,
  KPIMetrics,
  RegionalSales,
  WeeklyTrend,
  CategoryPerformance,
  StoreAchievement,
  StockoutItem,
  AutomatedInsights,
  FilterState,
} from '../types/retail';
import { formatToDDMMYYYY, compareDDMMYYYY } from './dateUtils';

export function calculateKPIs(records: RetailRecord[]): KPIMetrics {
  if (records.length === 0) {
    return {
      totalNetSales: 0,
      totalGrossSales: 0,
      totalTargetSales: 0,
      targetAchievement: 0,
      atv: 0,
      returnRate: 0,
      discountRate: 0,
      totalOrders: 0,
      totalReturnAmount: 0,
      totalDiscountAmount: 0,
      salesGap: 0,
    };
  }

  const totals = records.reduce(
    (acc, r) => {
      acc.net += r.netSales;
      acc.gross += r.grossSales;
      acc.target += r.targetSales;
      acc.returns += r.returnAmount;
      acc.discounts += r.discountAmount;
      acc.orders += r.ordersCount;
      return acc;
    },
    { net: 0, gross: 0, target: 0, returns: 0, discounts: 0, orders: 0 }
  );

  const targetAchievement = totals.target > 0 ? (totals.net / totals.target) * 100 : 0;
  const atv = totals.orders > 0 ? totals.net / totals.orders : 0;
  const returnRate = totals.net > 0 ? (totals.returns / totals.net) * 100 : 0;
  const discountRate = totals.gross > 0 ? (totals.discounts / totals.gross) * 100 : 0;
  const salesGap = totals.net - totals.target;

  return {
    totalNetSales: totals.net,
    totalGrossSales: totals.gross,
    totalTargetSales: totals.target,
    targetAchievement,
    atv,
    returnRate,
    discountRate,
    totalOrders: totals.orders,
    totalReturnAmount: totals.returns,
    totalDiscountAmount: totals.discounts,
    salesGap,
  };
}

export function getRegionalSales(records: RetailRecord[]): RegionalSales[] {
  const map = new Map<string, { net: number; target: number; gross: number; returns: number; discounts: number; orders: number }>();

  for (const r of records) {
    const reg = r.region || 'Unassigned';
    const curr = map.get(reg) || { net: 0, target: 0, gross: 0, returns: 0, discounts: 0, orders: 0 };
    curr.net += r.netSales;
    curr.target += r.targetSales;
    curr.gross += r.grossSales;
    curr.returns += r.returnAmount;
    curr.discounts += r.discountAmount;
    curr.orders += r.ordersCount;
    map.set(reg, curr);
  }

  const result: RegionalSales[] = [];
  map.forEach((val, region) => {
    const achievement = val.target > 0 ? (val.net / val.target) * 100 : 0;
    result.push({
      region,
      netSales: val.net,
      targetSales: val.target,
      achievement,
      grossSales: val.gross,
      returnAmount: val.returns,
      discountAmount: val.discounts,
      orderCount: val.orders,
    });
  });

  return result.sort((a, b) => b.netSales - a.netSales);
}

export function getWeeklyTrends(records: RetailRecord[]): WeeklyTrend[] {
  const map = new Map<string, { net: number; target: number; gross: number; returns: number; dateStr: string }>();

  for (const r of records) {
    // Standardize to DD-MM-YYYY date format for trend plotting
    const rawVal = r.date || r.week;
    const dateFormatted = formatToDDMMYYYY(rawVal);

    const curr = map.get(dateFormatted) || {
      net: 0,
      target: 0,
      gross: 0,
      returns: 0,
      dateStr: dateFormatted,
    };
    curr.net += r.netSales;
    curr.target += r.targetSales;
    curr.gross += r.grossSales;
    curr.returns += r.returnAmount;
    map.set(dateFormatted, curr);
  }

  const result: WeeklyTrend[] = [];
  map.forEach((val, dateKey) => {
    result.push({
      date: dateKey,
      week: dateKey,
      displayDate: dateKey,
      netSales: val.net,
      targetSales: val.target,
      grossSales: val.gross,
      returns: val.returns,
    });
  });

  // Sort weeks/dates chronologically by DD-MM-YYYY
  return result.sort((a, b) => compareDDMMYYYY(a.date || a.week, b.date || b.week));
}

export function getCategoryPerformance(records: RetailRecord[]): CategoryPerformance[] {
  const map = new Map<string, { gross: number; net: number; discounts: number; returns: number }>();

  for (const r of records) {
    const cat = r.productCategory || 'Other';
    const curr = map.get(cat) || { gross: 0, net: 0, discounts: 0, returns: 0 };
    curr.gross += r.grossSales;
    curr.net += r.netSales;
    curr.discounts += r.discountAmount;
    curr.returns += r.returnAmount;
    map.set(cat, curr);
  }

  const result: CategoryPerformance[] = [];
  map.forEach((val, category) => {
    const returnRate = val.net > 0 ? (val.returns / val.net) * 100 : 0;
    const discountRate = val.gross > 0 ? (val.discounts / val.gross) * 100 : 0;
    result.push({
      category,
      grossSales: val.gross,
      netSales: val.net,
      discountAmount: val.discounts,
      returnAmount: val.returns,
      returnRate,
      discountRate,
    });
  });

  return result.sort((a, b) => b.grossSales - a.grossSales);
}

export function getStoreLeaderboard(records: RetailRecord[]): {
  top10: StoreAchievement[];
  bottom10: StoreAchievement[];
  allStores: StoreAchievement[];
} {
  const map = new Map<string, { net: number; target: number; region: string; city: string; format: string }>();

  for (const r of records) {
    const key = r.store;
    const curr = map.get(key) || {
      net: 0,
      target: 0,
      region: r.region,
      city: r.city,
      format: r.storeFormat,
    };
    curr.net += r.netSales;
    curr.target += r.targetSales;
    map.set(key, curr);
  }

  const allStores: StoreAchievement[] = [];
  map.forEach((val, store) => {
    const achievement = val.target > 0 ? (val.net / val.target) * 100 : 0;
    const deficit = Math.max(0, val.target - val.net);
    allStores.push({
      store,
      region: val.region,
      city: val.city,
      format: val.format,
      netSales: val.net,
      targetSales: val.target,
      achievement,
      deficit,
    });
  });

  // Sort by achievement descending
  const sortedByAchievement = [...allStores].sort((a, b) => b.achievement - a.achievement);
  const top10 = sortedByAchievement.slice(0, 10);
  
  // Sort ascending for bottom stores
  const bottom10 = [...allStores]
    .sort((a, b) => a.achievement - b.achievement)
    .slice(0, 10);

  return { top10, bottom10, allStores };
}

export function getStockoutRisks(records: RetailRecord[]): StockoutItem[] {
  // Aggregate by store + product/category to find current inventory status
  const itemMap = new Map<string, StockoutItem>();

  for (const r of records) {
    const key = `${r.store}__${r.productCategory}__${r.productName || 'Default'}`;
    const deficit = r.reorderLevel - r.inventoryLevel;
    
    if (r.inventoryLevel <= r.reorderLevel) {
      let urgency: 'Critical' | 'High' | 'Warning' = 'Warning';
      if (r.inventoryLevel === 0 || deficit >= 15) {
        urgency = 'Critical';
      } else if (deficit >= 5) {
        urgency = 'High';
      }

      itemMap.set(key, {
        id: r.id,
        store: r.store,
        region: r.region,
        category: r.productCategory,
        productName: r.productName || r.productCategory,
        inventoryLevel: r.inventoryLevel,
        reorderLevel: r.reorderLevel,
        deficitUnits: Math.max(0, deficit),
        urgency,
      });
    }
  }

  const list = Array.from(itemMap.values());
  // Sort by urgency: Critical first, then High, then Warning
  const urgencyWeight = { Critical: 3, High: 2, Warning: 1 };
  return list.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency] || b.deficitUnits - a.deficitUnits);
}

export function generateAutomatedInsights(records: RetailRecord[]): AutomatedInsights {
  const kpis = calculateKPIs(records);
  const regional = getRegionalSales(records);
  const { allStores } = getStoreLeaderboard(records);
  const categoryPerf = getCategoryPerformance(records);
  const stockouts = getStockoutRisks(records);

  // Best & Worst Performing Regions by sales volume and achievement
  let bestRegion = { name: 'N/A', sales: 0, achievement: 0 };
  let worstRegion = { name: 'N/A', sales: 0, achievement: 0 };

  if (regional.length > 0) {
    const sortedBySales = [...regional].sort((a, b) => b.netSales - a.netSales);
    bestRegion = {
      name: sortedBySales[0].region,
      sales: sortedBySales[0].netSales,
      achievement: sortedBySales[0].achievement,
    };
    worstRegion = {
      name: sortedBySales[sortedBySales.length - 1].region,
      sales: sortedBySales[sortedBySales.length - 1].netSales,
      achievement: sortedBySales[sortedBySales.length - 1].achievement,
    };
  }

  // Stores Missing Target: failing to hit target (achievement < 100%) along with deficit value
  const storesMissingTarget = allStores
    .filter((s) => s.achievement < 100 && s.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit)
    .map((s) => ({
      store: s.store,
      achievement: s.achievement,
      deficit: s.deficit,
      target: s.targetSales,
      netSales: s.netSales,
    }));

  // High-Return Categories: return rate exceeding acceptable threshold (> 10%)
  const highReturnCategories = categoryPerf
    .filter((c) => c.returnRate > 10)
    .sort((a, b) => b.returnRate - a.returnRate)
    .map((c) => ({
      category: c.category,
      returnRate: c.returnRate,
      returnAmount: c.returnAmount,
      netSales: c.netSales,
    }));

  // Narrative summary synthesis
  const achStatus = kpis.targetAchievement >= 100 ? 'exceeding' : kpis.targetAchievement >= 90 ? 'approaching' : 'falling short of';
  const executiveSummary = `During this reporting cycle across ${records.length} retail transactions, overall Net Sales totaled $${(kpis.totalNetSales / 1000).toFixed(1)}k against a target of $${(kpis.totalTargetSales / 1000).toFixed(1)}k (${kpis.targetAchievement.toFixed(1)}% target achievement, ${achStatus} benchmark). Regional dispersion was anchored by ${bestRegion.name} generating the strongest volume ($${(bestRegion.sales / 1000).toFixed(1)}k), while ${worstRegion.name} trailed at $${(worstRegion.sales / 1000).toFixed(1)}k. ${storesMissingTarget.length} store location${storesMissingTarget.length === 1 ? '' : 's'} registered target deficits, collectively creating a revenue lag of $${(storesMissingTarget.reduce((sum, s) => sum + s.deficit, 0) / 1000).toFixed(1)}k. Operational attention is required for ${highReturnCategories.length} category with elevated returns exceeding the 10% threshold, along with ${stockouts.length} inventory line items breaching reorder thresholds.`;

  const keyRecommendations: string[] = [];
  if (storesMissingTarget.length > 0) {
    const topDeficit = storesMissingTarget[0];
    keyRecommendations.push(
      `Remediate store performance at ${topDeficit.store}: Currently operating at ${topDeficit.achievement.toFixed(1)}% of quota with an addressable deficit of $${(topDeficit.deficit / 1000).toFixed(1)}k.`
    );
  }
  if (highReturnCategories.length > 0) {
    const worstReturn = highReturnCategories[0];
    keyRecommendations.push(
      `Mitigate return friction in ${worstReturn.category}: Return rate sits at ${worstReturn.returnRate.toFixed(1)}% ($${(worstReturn.returnAmount / 1000).toFixed(1)}k refunded). Review size charts, fabrication specs, and customer satisfaction logs.`
    );
  }
  if (stockouts.length > 0) {
    const criticalCount = stockouts.filter((s) => s.urgency === 'Critical').length;
    keyRecommendations.push(
      `Expedite purchase orders for ${criticalCount > 0 ? `${criticalCount} critical stockouts` : `${stockouts.length} reorder-level alerts`}: Stock replenishment is urgent to prevent missed sales velocity.`
    );
  }
  if (kpis.discountRate > 15) {
    keyRecommendations.push(
      `Rationalize promotional discounting: Aggregate discount rate is elevated at ${kpis.discountRate.toFixed(1)}% of gross merchandise volume. Shift towards targeted loyalty incentives.`
    );
  } else {
    keyRecommendations.push(
      `Maintain balanced margin discipline: Discount rates remain controlled at ${kpis.discountRate.toFixed(1)}% with an Average Transaction Value of $${kpis.atv.toFixed(2)}.`
    );
  }

  return {
    bestRegion,
    worstRegion,
    storesMissingTarget,
    highReturnCategories,
    stockoutCount: stockouts.length,
    criticalStockouts: stockouts.slice(0, 10),
    executiveSummary,
    keyRecommendations,
  };
}

export function filterRecords(records: RetailRecord[], filters: FilterState): RetailRecord[] {
  return records.filter((r) => {
    if (filters.timePeriods.length > 0) {
      const formattedDate = formatToDDMMYYYY(r.date);
      const formattedWeek = formatToDDMMYYYY(r.week);
      const matched =
        filters.timePeriods.includes(r.week) ||
        filters.timePeriods.includes(r.date) ||
        filters.timePeriods.includes(formattedDate) ||
        filters.timePeriods.includes(formattedWeek);
      if (!matched) return false;
    }
    if (filters.regions.length > 0 && !filters.regions.includes(r.region)) {
      return false;
    }
    if (filters.cities.length > 0 && !filters.cities.includes(r.city)) {
      return false;
    }
    if (filters.stores.length > 0 && !filters.stores.includes(r.store)) {
      return false;
    }
    if (filters.storeFormats.length > 0 && !filters.storeFormats.includes(r.storeFormat)) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(r.productCategory)) {
      return false;
    }
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        r.store.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.productCategory.toLowerCase().includes(q) ||
        (r.productName && r.productName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

export function getUniqueFilterOptions(records: RetailRecord[]) {
  const weeks = Array.from(
    new Set(records.map((r) => formatToDDMMYYYY(r.date || r.week)))
  ).sort((a, b) => compareDDMMYYYY(a, b));
  const regions = Array.from(new Set(records.map((r) => r.region))).sort();
  const cities = Array.from(new Set(records.map((r) => r.city))).sort();
  const stores = Array.from(new Set(records.map((r) => r.store))).sort();
  const storeFormats = Array.from(new Set(records.map((r) => r.storeFormat))).sort();
  const categories = Array.from(new Set(records.map((r) => r.productCategory))).sort();

  return {
    weeks,
    regions,
    cities,
    stores,
    storeFormats,
    categories,
  };
}
