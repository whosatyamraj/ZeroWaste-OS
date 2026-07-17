'use client';
import { useState, useEffect } from 'react';
import { DemandForecastChart } from '../components/DemandForecastChart';
import { AIForecastResponse, ForecastDataPoint } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, TrendingDown, Target, FileWarning } from 'lucide-react';

const mockForecastData: ForecastDataPoint[] = [
  { day: 'Mon', predictedDemand: 120, actualDemand: 115, confidenceInterval: [110, 130] },
  { day: 'Tue', predictedDemand: 135, actualDemand: 140, confidenceInterval: [125, 145] },
  { day: 'Wed', predictedDemand: 150, actualDemand: 145, confidenceInterval: [140, 160] },
  { day: 'Thu', predictedDemand: 180, actualDemand: 185, confidenceInterval: [170, 190] },
  { day: 'Fri', predictedDemand: 240, actualDemand: 230, confidenceInterval: [220, 260] },
  { day: 'Sat', predictedDemand: 300, confidenceInterval: [280, 320] }, // Future prediction
  { day: 'Sun', predictedDemand: 280, confidenceInterval: [260, 300] }, // Future prediction
];

const mockAIResponse: AIForecastResponse = {
  accuracy: 94.5,
  forecast: mockForecastData,
  recommendations: [
    "Reduce 'Bakery' production by 15% on Wednesday due to predicted heavy rain.",
    "Increase 'Prepared Meals' for Friday evening; local sports event expected to drive 20% more foot traffic.",
    "Current dynamic pricing strategy is working. Maintain 30% discount trigger at 4 hours before expiry.",
  ]
};

export function AIInsightsPage() {
  const [data, setData] = useState<AIForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockAIResponse);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Decision Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Machine Learning insights to optimize your production and reduce waste.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Lightbulb className="w-4 h-4" />
          Generate New Strategy
        </Button>
      </div>

      {isLoading || !data ? (
        <div className="space-y-6">
          <div className="h-[400px] bg-muted rounded-xl animate-pulse" />
          <div className="h-[200px] bg-muted rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model Accuracy</p>
                  <p className="text-2xl font-bold text-foreground">{data.accuracy}%</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Waste Reduction</p>
                  <p className="text-2xl font-bold text-foreground">32%</p>
                  <p className="text-xs text-muted-foreground">vs Baseline</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-danger/5 border-danger/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center shrink-0">
                  <FileWarning className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Alerts</p>
                  <p className="text-2xl font-bold text-foreground">1 Active</p>
                  <p className="text-xs text-danger font-medium">Overproduction risk today</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DemandForecastChart data={data.forecast} />

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-foreground leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
