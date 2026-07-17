import { motion } from 'framer-motion';
import { HandHelping, MapPin, Clock, CheckCircle2, Navigation, Package, Award, Timer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const tasks = [
  { id: '1', title: 'Pickup from The Grand Kitchen', description: 'Collect 50 portions of mixed rice & curry', from: '123 Main St', to: 'FeedForward NGO, 789 Oak Ave', distance: '4.2 km', time: '30 min', status: 'available', priority: 'high', meals: 50 },
  { id: '2', title: 'Deliver Bakery Items', description: '15 loaves of bread + assorted pastries', from: '456 Baker St', to: 'Community Kitchen, 321 Pine St', distance: '2.8 km', time: '20 min', status: 'assigned', priority: 'medium', meals: 30 },
  { id: '3', title: 'Fruit Box Distribution', description: '20 boxes of mixed seasonal fruits', from: 'Sunrise Farms, 789 Farm Rd', to: 'Multiple drop-off points', distance: '8.1 km', time: '45 min', status: 'in-progress', priority: 'medium', meals: 80 },
  { id: '4', title: 'Dairy Pickup & Deliver', description: 'Yogurt, milk, and cheese bundles', from: 'Fresh Valley Dairy', to: 'Hope Shelter', distance: '5.5 km', time: '35 min', status: 'completed', priority: 'low', meals: 45 },
];

const myStats = [
  { label: 'Deliveries Done', value: '142', icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Meals Delivered', value: '4,280', icon: Package, color: 'text-cyan-400' },
  { label: 'Hours Volunteered', value: '186', icon: Timer, color: 'text-violet-400' },
  { label: 'Impact Score', value: 'A+', icon: Award, color: 'text-amber-400' },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function VolunteerPortalPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <HandHelping className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Volunteer Portal</h1>
              <p className="text-sm text-muted-foreground">Accept pickup tasks and deliver food to those in need</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {myStats.map((stat, i) => (
            <motion.div key={stat.label} className="glass-card p-4 flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Available & Active Tasks</h2>
          {tasks.map((task, i) => (
            <motion.div key={task.id} className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{task.title}</h3>
                    <Badge className={`text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> {task.from}</span>
                    <span>→</span>
                    <span className="flex items-center gap-1"><Navigation className="w-3 h-3 text-cyan-400" /> {task.to}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.distance}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{task.time}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> ~{task.meals} meals</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {task.status === 'available' && (
                    <Button size="sm" className="bg-accent text-white rounded-lg text-xs">Accept Task</Button>
                  )}
                  {task.status === 'assigned' && (
                    <Button size="sm" className="bg-blue-500 text-white rounded-lg text-xs gap-1">
                      <Navigation className="w-3 h-3" /> Start Route
                    </Button>
                  )}
                  {task.status === 'in-progress' && (
                    <Button size="sm" className="bg-emerald-500 text-white rounded-lg text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Complete Delivery
                    </Button>
                  )}
                  {task.status === 'completed' && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Completed ✓</Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
