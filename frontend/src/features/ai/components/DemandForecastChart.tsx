import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ForecastDataPoint } from '../types';

interface DemandForecastProps {
  data: ForecastDataPoint[];
}

export function DemandForecastChart({ data }: DemandForecastProps) {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle>AI Demand Forecasting</CardTitle>
        <CardDescription>Predicted vs Actual demand based on historical data, weather, and local events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis 
                yAxisId="left" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                yAxisId="left" 
                dataKey="actualDemand" 
                name="Actual Demand" 
                fill="hsl(var(--muted))" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="predictedDemand" 
                name="AI Prediction" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
