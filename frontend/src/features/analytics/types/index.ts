export interface DashboardMetrics {
  totalRevenue: number;
  foodSavedKg: number;
  co2ReducedKg: number;
  itemsSold: number;
  itemsDonated: number;
  revenueTrend: number;
  foodSavedTrend: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  foodSaved: number;
}
