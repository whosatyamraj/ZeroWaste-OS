import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';

const insights = [
  { id: '1', title: 'Rice waste increased by 15% this month', description: 'Compared to last month, rice-based dishes generated 15% more surplus. Consider reducing rice portions by 10% or offering rice as an optional side.', category: 'alert', impact: 'high', confidence: 94, trend: 'up', metric: '+15%', actionable: true, action: 'Reduce rice preparation by 10%' },
  { id: '2', title: 'Paneer dishes produce 30% less waste', description: 'Paneer-based items consistently have the lowest waste ratio across all categories. Consider expanding the paneer menu to capitalize on this efficiency.', category: 'optimization', impact: 'medium', confidence: 89, trend: 'down', metric: '-30%', actionable: true, action: 'Expand paneer menu' },
  { id: '3', title: 'Friday dinner generates the highest surplus', description: 'Friday evening consistently produces 25% more surplus than other days. AI recommends reducing Friday dinner prep by 15-20%.', category: 'prediction', impact: 'high', confidence: 92, trend: 'up', metric: '+25%', actionable: true, action: 'Reduce Friday prep by 15%' },
  { id: '4', title: 'Dairy products expire before consumption 40% of the time', description: 'Nearly half of dairy inventory expires before being used. Consider just-in-time ordering or smaller batch procurement for dairy items.', category: 'alert', impact: 'high', confidence: 87, trend: 'up', metric: '40%', actionable: true, action: 'Switch to JIT dairy ordering' },
  { id: '5', title: 'Lunch rush demand peaks at 12:30 PM', description: 'Historical data shows demand peaks sharply at 12:30 PM. Preparing 70% of lunch orders by 12:15 could reduce wait times by 8 minutes.', category: 'recommendation', impact: 'medium', confidence: 91, trend: 'stable', metric: '12:30 PM', actionable: true, action: 'Pre-prep 70% by 12:15' },
  { id: '6', title: 'Composting could save $420/month', description: 'Currently 12% of waste goes to landfill. Redirecting to composting partners could save $420/month and reduce CO₂ by 180kg.', category: 'optimization', impact: 'medium', confidence: 85, trend: 'stable', metric: '$420', actionable: true, action: 'Connect with composting partner' },
];

const categoryIcons: Record<string, typeof Brain> = {
  prediction: TrendingUp,
  alert: AlertTriangle,
  recommendation: Lightbulb,
  optimization: Target,
};

const categoryColors: Record<string, string> = {
  prediction: 'from-blue-500 to-cyan-500',
  alert: 'from-red-500 to-orange-500',
  recommendation: 'from-amber-500 to-yellow-500',
  optimization: 'from-emerald-500 to-teal-500',
};

const impactColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function AIInsightsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Insights Engine</h1>
              <p className="text-sm text-muted-foreground">Intelligent analysis of your waste patterns and operations</p>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Insights', value: '24', color: 'text-violet-400' },
            { label: 'Actionable', value: '18', color: 'text-emerald-400' },
            { label: 'High Impact', value: '8', color: 'text-red-400' },
            { label: 'Avg Confidence', value: '91%', color: 'text-cyan-400' },
          ].map((stat, i) => (
            <motion.div key={stat.label} className="glass-card p-4 text-center"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {insights.map((insight, i) => {
            const Icon = categoryIcons[insight.category] || Brain;
            return (
              <motion.div
                key={insight.id}
                className="glass-card p-6 hover:border-accent/20 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[insight.category]} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-[10px] ${impactColors[insight.impact]}`}>{insight.impact} impact</Badge>
                        <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">{insight.confidence}%</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{insight.description}</p>
                    {insight.actionable && (
                      <div className="flex items-center gap-2 text-xs text-accent group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-medium">{insight.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
