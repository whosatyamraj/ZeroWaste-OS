import { motion } from 'framer-motion';
import { ChefHat, Flame, Clock, AlertTriangle, CheckCircle2, Package, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';

const orders = [
  { id: '#1247', items: 'Butter Chicken x3, Naan x6, Rice x3', status: 'preparing', time: '12 min', priority: 'high' },
  { id: '#1248', items: 'Caesar Salad x2, Grilled Salmon x2', status: 'ready', time: '2 min', priority: 'medium' },
  { id: '#1249', items: 'Veggie Pizza x4, Garlic Bread x2', status: 'queued', time: '25 min', priority: 'low' },
  { id: '#1250', items: 'Thai Green Curry x2, Jasmine Rice x2', status: 'preparing', time: '8 min', priority: 'medium' },
  { id: '#1251', items: 'Pasta Carbonara x3, Tiramisu x3', status: 'ready', time: '1 min', priority: 'high' },
];

const inventoryAlerts = [
  { item: 'Fresh Tomatoes', stock: '15%', status: 'critical', action: 'Order placed automatically' },
  { item: 'Chicken Breast', stock: '28%', status: 'low', action: 'Reorder suggested' },
  { item: 'Basmati Rice', stock: '45%', status: 'moderate', action: 'Sufficient for 2 days' },
  { item: 'Olive Oil', stock: '62%', status: 'good', action: 'No action needed' },
];

const production = [
  { dish: 'Butter Chicken', prepared: 45, predicted: 52, waste: 3 },
  { dish: 'Caesar Salad', prepared: 30, predicted: 28, waste: 5 },
  { dish: 'Veggie Pizza', prepared: 38, predicted: 40, waste: 2 },
  { dish: 'Thai Curry', prepared: 22, predicted: 25, waste: 1 },
  { dish: 'Pasta Carbonara', prepared: 35, predicted: 32, waste: 4 },
];

const statusStyles: Record<string, { bg: string; dot: string }> = {
  queued: { bg: 'bg-surface-2', dot: 'bg-muted-foreground' },
  preparing: { bg: 'bg-amber-500/5 border-amber-500/20', dot: 'bg-amber-400 animate-pulse' },
  ready: { bg: 'bg-emerald-500/5 border-emerald-500/20', dot: 'bg-emerald-400' },
};

export default function KitchenIntelPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kitchen Intelligence</h1>
              <p className="text-sm text-muted-foreground">Real-time monitoring • Live data via Socket.io</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ml-auto animate-pulse">● LIVE</Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orders Board */}
          <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Active Orders
            </h3>
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className={`p-3 rounded-lg border ${statusStyles[order.status].bg} transition-all`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusStyles[order.status].dot}`} />
                      <span className="text-xs font-semibold text-foreground">{order.id}</span>
                      <Badge className={`text-[10px] capitalize ${order.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400' : order.status === 'preparing' ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-3 text-muted-foreground'}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {order.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4">{order.items}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Inventory Alerts */}
          <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" /> Inventory Status
            </h3>
            <div className="space-y-3">
              {inventoryAlerts.map((item) => (
                <div key={item.item} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.status === 'critical' ? 'bg-red-500/10' : item.status === 'low' ? 'bg-amber-500/10' : item.status === 'moderate' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                    {item.status === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                     item.status === 'low' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                     <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">{item.item}</p>
                      <span className={`text-xs font-bold ${item.status === 'critical' ? 'text-red-400' : item.status === 'low' ? 'text-amber-400' : 'text-emerald-400'}`}>{item.stock}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.action}</p>
                    <div className="w-full h-1.5 bg-surface-3 rounded-full mt-1">
                      <div className={`h-full rounded-full ${item.status === 'critical' ? 'bg-red-400' : item.status === 'low' ? 'bg-amber-400' : item.status === 'moderate' ? 'bg-blue-400' : 'bg-emerald-400'}`}
                        style={{ width: item.stock }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Production vs Demand */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" /> Production vs AI-Predicted Demand
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-3">Dish</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-3">Prepared</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-3">AI Predicted</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-3">Variance</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-3">Waste</th>
                </tr>
              </thead>
              <tbody>
                {production.map((row) => {
                  const variance = row.prepared - row.predicted;
                  return (
                    <tr key={row.dish} className="border-b border-border/50">
                      <td className="p-3 text-sm text-foreground">{row.dish}</td>
                      <td className="p-3 text-sm text-center text-foreground">{row.prepared}</td>
                      <td className="p-3 text-sm text-center text-cyan-400">{row.predicted}</td>
                      <td className="p-3 text-sm text-center">
                        <span className={variance > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                          {variance > 0 ? '+' : ''}{variance}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-center text-red-400">{row.waste}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
