import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Package, Store, Heart, AlertTriangle, ArrowUpRight, Clock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const overviewData = [
  { day: 'Mon', saved: 45, wasted: 12 },
  { day: 'Tue', saved: 52, wasted: 8 },
  { day: 'Wed', saved: 48, wasted: 15 },
  { day: 'Thu', saved: 61, wasted: 7 },
  { day: 'Fri', saved: 55, wasted: 20 },
  { day: 'Sat', saved: 72, wasted: 10 },
  { day: 'Sun', saved: 38, wasted: 5 },
];

const recentActivity = [
  { id: '1', type: 'donation', message: 'Donated 50kg rice to FeedForward NGO', time: '2 hours ago', status: 'completed' },
  { id: '2', type: 'sale', message: 'Sold 20 surplus lunch boxes at 40% discount', time: '4 hours ago', status: 'completed' },
  { id: '3', type: 'alert', message: 'Dairy inventory expiring in 24 hours', time: '5 hours ago', status: 'warning' },
  { id: '4', type: 'forecast', message: 'AI predicts 15% lower demand tomorrow', time: '6 hours ago', status: 'info' },
  { id: '5', type: 'pickup', message: 'Volunteer picked up donation #1247', time: '8 hours ago', status: 'completed' },
];

const quickStats = [
  { label: 'Active Listings', value: '24', change: '+3', icon: Store, color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400' },
  { label: 'Pending Orders', value: '8', change: '+2', icon: Package, color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400' },
  { label: 'Donations Today', value: '5', change: '+1', icon: Heart, color: 'from-pink-500/20 to-pink-500/5', iconColor: 'text-pink-400' },
  { label: 'Expiry Alerts', value: '3', change: '-2', icon: AlertTriangle, color: 'from-red-500/20 to-red-500/5', iconColor: 'text-red-400' },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back! Here's your waste intelligence overview.</p>
              </div>
            </div>
            <Link to="/marketplace">
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl">
                Add Surplus <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card p-5 hover:border-accent/20 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-emerald-400">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart + Activity */}
        <div className="grid lg:grid-cols-5 gap-6">
          <motion.div
            className="glass-card p-6 lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Weekly Overview</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Saved</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /> Wasted</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={overviewData}>
                <defs>
                  <linearGradient id="dSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="saved" stroke="#10b981" fill="url(#dSaved)" strokeWidth={2} />
                <Area type="monotone" dataKey="wasted" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className="glass-card p-6 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-2/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.status === 'completed' ? 'bg-emerald-400' : item.status === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{item.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Recommendation Banner */}
        <motion.div
          className="glass-card p-6 border-accent/20 glow-accent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">AI Recommendation</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on historical patterns, reduce Friday dinner preparation by 15%. This could save approximately $340/week.
              </p>
            </div>
            <Badge variant="outline" className="border-accent/30 text-accent shrink-0">92% confidence</Badge>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
