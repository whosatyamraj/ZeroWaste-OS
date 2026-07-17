'use client';
import { useState, useEffect } from 'react';
import { AnalyticsMetrics } from '../components/AnalyticsMetrics';
import { RevenueChart } from '../components/RevenueChart';
import { DashboardMetrics, ChartDataPoint } from '../types';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Mock data generator for demonstration
const generateMockChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    data.push({
      date: d.toISOString(),
      revenue: Math.floor(Math.random() * 500) + 100,
      foodSaved: Math.floor(Math.random() * 50) + 10,
    });
  }
  return data;
};

const mockMetrics: DashboardMetrics = {
  totalRevenue: 12450.50,
  foodSavedKg: 850.2,
  co2ReducedKg: 2100.5,
  itemsSold: 432,
  itemsDonated: 156,
  revenueTrend: 12.5,
  foodSavedTrend: 8.2,
};

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be a TanStack Query hook calling apiClient
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setMetrics(mockMetrics);
      setChartData(generateMockChartData());
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Overview</h1>
          <p className="text-muted-foreground mt-1">
            Track your financial recovery and environmental impact.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <Button variant="outline" className="gap-2 shrink-0">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {isLoading || !metrics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-[400px] bg-muted rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <AnalyticsMetrics metrics={metrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart data={chartData} />
            
            {/* Environmental Impact Summary */}
            <Card className="col-span-1 border-border shadow-sm">
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>Your contribution to sustainability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CO₂ Emissions Prevented</p>
                    <p className="text-2xl font-bold">{metrics.co2ReducedKg.toLocaleString()} kg</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                    <span className="text-2xl">💧</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Water Saved</p>
                    <p className="text-2xl font-bold">{(metrics.foodSavedKg * 1000).toLocaleString()} Liters</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-semibold text-sm mb-2">Impact Milestone</h4>
                  <p className="text-sm text-muted-foreground">
                    You've saved enough food to feed approximately <strong className="text-foreground">{Math.floor(metrics.foodSavedKg / 0.5)}</strong> people this month!
                  </p>
                  <div className="w-full bg-border h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-accent h-full w-[85%]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
