import { motion } from 'framer-motion';
import {
  BarChart3, DollarSign, TrendingDown, ShoppingCart, Users,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// ─── Mock Data ──────────────────────────────────────────────────────

const monthlyTrendsData = [
  { month: 'Jan', revenue: 12400, savings: 3200, waste: 4800 },
  { month: 'Feb', revenue: 14100, savings: 4100, waste: 4200 },
  { month: 'Mar', revenue: 15800, savings: 5500, waste: 3600 },
  { month: 'Apr', revenue: 17200, savings: 6800, waste: 3100 },
  { month: 'May', revenue: 19500, savings: 8200, waste: 2700 },
  { month: 'Jun', revenue: 21800, savings: 9600, waste: 2200 },
  { month: 'Jul', revenue: 20100, savings: 8900, waste: 2500 },
  { month: 'Aug', revenue: 23400, savings: 10400, waste: 1900 },
  { month: 'Sep', revenue: 25100, savings: 11800, waste: 1600 },
  { month: 'Oct', revenue: 24200, savings: 11200, waste: 1800 },
  { month: 'Nov', revenue: 26800, savings: 12500, waste: 1400 },
  { month: 'Dec', revenue: 28500, savings: 13900, waste: 1100 },
];

const wasteByCategoryData = [
  { category: 'Dairy', amount: 340, fill: '#f59e0b' },
  { category: 'Vegetables', amount: 520, fill: '#10b981' },
  { category: 'Fruits', amount: 290, fill: '#f97316' },
  { category: 'Grains', amount: 180, fill: '#06b6d4' },
  { category: 'Meat', amount: 410, fill: '#ef4444' },
  { category: 'Bakery', amount: 260, fill: '#8b5cf6' },
  { category: 'Beverages', amount: 150, fill: '#3b82f6' },
];

const userGrowthData = [
  { month: 'Jul', restaurants: 120, ngo: 45, volunteers: 210 },
  { month: 'Aug', restaurants: 155, ngo: 58, volunteers: 290 },
  { month: 'Sep', restaurants: 198, ngo: 72, volunteers: 380 },
  { month: 'Oct', restaurants: 240, ngo: 89, volunteers: 460 },
  { month: 'Nov', restaurants: 310, ngo: 105, volunteers: 570 },
  { month: 'Dec', restaurants: 385, ngo: 128, volunteers: 680 },
];

const kpiCards = [
  {
    label: 'Revenue Saved',
    value: '$28,500',
    change: '+12.4%',
    isPositive: true,
    icon: DollarSign,
    gradient: 'from-emerald-500 to-green-600',
    bgGlow: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    label: 'Waste Reduction Rate',
    value: '73.2%',
    change: '+8.1%',
    isPositive: true,
    icon: TrendingDown,
    gradient: 'from-cyan-500 to-blue-600',
    bgGlow: 'from-cyan-500/20 to-cyan-500/5',
  },
  {
    label: 'Avg Order Value',
    value: '$42.50',
    change: '-2.3%',
    isPositive: false,
    icon: ShoppingCart,
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'from-amber-500/20 to-amber-500/5',
  },
  {
    label: 'Active Users',
    value: '1,193',
    change: '+24.6%',
    isPositive: true,
    icon: Users,
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'from-violet-500/20 to-violet-500/5',
  },
];

// ─── Custom Tooltip ─────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  color: '#f8fafc',
  fontSize: '12px',
  boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
};

// ─── Component ──────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive insights into your waste reduction performance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                className="glass-card p-5 hover:border-accent/20 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.bgGlow} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 bg-gradient-to-br ${kpi.gradient} bg-clip-text`} style={{ color: kpi.isPositive ? '#10b981' : '#f59e0b' }} />
                  </div>
                  <div
                    className={`flex items-center gap-0.5 text-xs font-semibold ${
                      kpi.isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {kpi.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Large Area Chart — Monthly Revenue & Savings */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Monthly Revenue & Savings Trends
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tracking financial impact of waste reduction over the year
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Revenue
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Savings
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                Waste Cost
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyTrendsData}>
              <defs>
                <linearGradient id="aRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`$${value?.toLocaleString() ?? 0}`, undefined]} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="url(#aRevenue)"
                strokeWidth={2}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#06b6d4"
                fill="url(#aSavings)"
                strokeWidth={2}
                name="Savings"
              />
              <Area
                type="monotone"
                dataKey="waste"
                stroke="#ef4444"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Waste Cost"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Two Charts Side by Side */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Horizontal Bar Chart — Waste by Category */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground">
                Waste by Category
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kilograms wasted per food category this month
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteByCategoryData} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} unit=" kg" />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any) => [`${value} kg`, 'Waste']}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                />
                <Bar
                  dataKey="amount"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={28}
                >
                  {wasteByCategoryData.map((entry) => (
                    <rect key={entry.category} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Line Chart — User Growth */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  User Growth
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Platform adoption over the last 6 months
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  Restaurants
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                  NGOs
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  Volunteers
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="restaurants"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
                  name="Restaurants"
                />
                <Line
                  type="monotone"
                  dataKey="ngo"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#0f172a', strokeWidth: 2 }}
                  name="NGOs"
                />
                <Line
                  type="monotone"
                  dataKey="volunteers"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }}
                  name="Volunteers"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Summary Metrics Strip */}
        <motion.div
          className="glass-card p-5 glow-accent border-accent/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Total Meals Saved', value: '48,210', sub: 'this year' },
              { label: 'CO₂ Prevented', value: '12.4 tons', sub: 'environmental impact' },
              { label: 'Partner NGOs', value: '128', sub: 'active partnerships' },
              { label: 'Volunteer Hours', value: '5,840', sub: 'community contribution' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
