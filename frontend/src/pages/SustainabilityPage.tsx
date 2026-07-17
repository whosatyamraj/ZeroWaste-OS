import { motion } from 'framer-motion';
import {
  Leaf, TrendingUp, TrendingDown, Droplets, Wind,
  Utensils, DollarSign, Recycle, Award,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const metrics = [
  { label: 'Food Saved', value: '2,847 kg', change: '+12.5%', trend: 'up' as const, icon: Leaf, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5' },
  { label: 'Meals Rescued', value: '7,118', change: '+8.3%', trend: 'up' as const, icon: Utensils, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-500/5' },
  { label: 'Money Saved', value: '$9,964', change: '+15.2%', trend: 'up' as const, icon: DollarSign, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5' },
  { label: 'CO₂ Reduced', value: '7,117 kg', change: '+12.5%', trend: 'up' as const, icon: Wind, color: 'text-violet-400', bg: 'from-violet-500/20 to-violet-500/5' },
  { label: 'Water Conserved', value: '2.8M L', change: '+10.1%', trend: 'up' as const, icon: Droplets, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5' },
  { label: 'Waste Reduction', value: '38.2%', change: '+5.4%', trend: 'up' as const, icon: Recycle, color: 'text-green-400', bg: 'from-green-500/20 to-green-500/5' },
];

const wasteTrend = [
  { month: 'Jan', saved: 180, wasted: 120 },
  { month: 'Feb', saved: 220, wasted: 100 },
  { month: 'Mar', saved: 260, wasted: 90 },
  { month: 'Apr', saved: 310, wasted: 75 },
  { month: 'May', saved: 380, wasted: 65 },
  { month: 'Jun', saved: 420, wasted: 55 },
  { month: 'Jul', saved: 470, wasted: 50 },
];

const wasteBreakdown = [
  { name: 'Donated', value: 42, color: '#10b981' },
  { name: 'Discounted', value: 28, color: '#06b6d4' },
  { name: 'Repurposed', value: 15, color: '#8b5cf6' },
  { name: 'Composted', value: 10, color: '#f59e0b' },
  { name: 'Wasted', value: 5, color: '#ef4444' },
];

const impactByCategory = [
  { category: 'Produce', saved: 420, wasted: 35 },
  { category: 'Dairy', saved: 280, wasted: 45 },
  { category: 'Bakery', saved: 350, wasted: 25 },
  { category: 'Meat', saved: 190, wasted: 60 },
  { category: 'Prepared', saved: 510, wasted: 40 },
  { category: 'Beverages', saved: 180, wasted: 15 },
];

export default function SustainabilityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sustainability Dashboard</h1>
              <p className="text-sm text-muted-foreground">Track your environmental impact in real-time</p>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="glass-card p-5 hover:border-accent/20 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.bg} flex items-center justify-center`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-3">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Waste Trend Area Chart */}
          <motion.div
            className="glass-card p-6 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">Food Saved vs Wasted Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={wasteTrend}>
                <defs>
                  <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wastedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }} />
                <Legend />
                <Area type="monotone" dataKey="saved" name="Saved (kg)" stroke="#10b981" fill="url(#savedGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="wasted" name="Wasted (kg)" stroke="#ef4444" fill="url(#wastedGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Waste Breakdown Pie */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">Surplus Disposition</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={wasteBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {wasteBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {wasteBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Impact by Category */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Impact by Food Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={impactByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }} />
              <Legend />
              <Bar dataKey="saved" name="Saved (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wasted" name="Wasted (kg)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
