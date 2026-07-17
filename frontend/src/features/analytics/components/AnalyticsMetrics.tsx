import { DashboardMetrics } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, Leaf, Package, HeartHandshake } from 'lucide-react';

interface AnalyticsMetricsProps {
  metrics: DashboardMetrics;
}

export function AnalyticsMetrics({ metrics }: AnalyticsMetricsProps) {
  const cards = [
    {
      title: 'Total Recovered Revenue',
      value: formatCurrency(metrics.totalRevenue),
      trend: metrics.revenueTrend,
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Food Saved (kg)',
      value: formatNumber(metrics.foodSavedKg),
      trend: metrics.foodSavedTrend,
      icon: Leaf,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'Items Sold',
      value: formatNumber(metrics.itemsSold),
      trend: 0,
      icon: Package,
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      title: 'Items Donated',
      value: formatNumber(metrics.itemsDonated),
      trend: 0,
      icon: HeartHandshake,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <Card key={i} className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold tracking-tight text-foreground">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            
            {card.trend !== 0 && (
              <div className="mt-4 flex items-center text-sm">
                {card.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-primary mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger mr-1" />
                )}
                <span className={card.trend > 0 ? 'text-primary font-medium' : 'text-danger font-medium'}>
                  {Math.abs(card.trend)}%
                </span>
                <span className="text-muted-foreground ml-1.5">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
