import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingDown, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const inventory = [
  { id: '1', name: 'Basmati Rice', category: 'Grains', stock: 85, min: 20, max: 100, unit: 'kg', expires: '2024-12-15', cost: 2.50, status: 'in-stock' },
  { id: '2', name: 'Fresh Tomatoes', category: 'Produce', stock: 8, min: 15, max: 50, unit: 'kg', expires: '2024-07-02', cost: 3.20, status: 'low-stock' },
  { id: '3', name: 'Chicken Breast', category: 'Meat', stock: 12, min: 10, max: 40, unit: 'kg', expires: '2024-07-01', cost: 8.50, status: 'expiring-soon' },
  { id: '4', name: 'Olive Oil', category: 'Oils', stock: 25, min: 5, max: 30, unit: 'L', expires: '2025-03-20', cost: 12.00, status: 'in-stock' },
  { id: '5', name: 'Greek Yogurt', category: 'Dairy', stock: 0, min: 10, max: 30, unit: 'kg', expires: '—', cost: 5.80, status: 'out-of-stock' },
  { id: '6', name: 'Mixed Herbs', category: 'Spices', stock: 3, min: 2, max: 10, unit: 'kg', expires: '2024-09-10', cost: 15.00, status: 'low-stock' },
  { id: '7', name: 'Paneer', category: 'Dairy', stock: 18, min: 8, max: 25, unit: 'kg', expires: '2024-07-05', cost: 7.00, status: 'in-stock' },
  { id: '8', name: 'All-Purpose Flour', category: 'Grains', stock: 45, min: 10, max: 60, unit: 'kg', expires: '2025-01-30', cost: 1.80, status: 'in-stock' },
];

const statusStyles: Record<string, string> = {
  'in-stock': 'bg-emerald-500/10 text-emerald-400',
  'low-stock': 'bg-amber-500/10 text-amber-400',
  'out-of-stock': 'bg-red-500/10 text-red-400',
  'expiring-soon': 'bg-orange-500/10 text-orange-400',
};

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const filtered = inventory.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = inventory.filter((i) => i.status === 'low-stock' || i.status === 'out-of-stock').length;
  const expiring = inventory.filter((i) => i.status === 'expiring-soon').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Inventory Intelligence</h1>
                <p className="text-sm text-muted-foreground">Track ingredients, stock levels, and expiry dates</p>
              </div>
            </div>
            <Button className="bg-accent text-white rounded-xl gap-1"><Plus className="w-4 h-4" /> Add Item</Button>
          </div>
        </motion.div>

        {/* Alert Bars */}
        <div className="grid sm:grid-cols-2 gap-4">
          {lowStock > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <TrendingDown className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-amber-400">{lowStock} items below minimum stock</span>
            </div>
          )}
          {expiring > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-orange-400">{expiring} items expiring soon</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-1 border-border rounded-xl" />
        </div>

        {/* Table */}
        <motion.div className="glass-card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Item', 'Category', 'Stock', 'Status', 'Expiry', 'Cost/Unit'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground p-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="p-4 text-xs text-muted-foreground">{item.category}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-surface-3 rounded-full">
                          <div className={`h-full rounded-full ${item.stock / item.max > 0.5 ? 'bg-emerald-400' : item.stock / item.max > 0.2 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.min((item.stock / item.max) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs text-foreground">{item.stock} {item.unit}</span>
                      </div>
                    </td>
                    <td className="p-4"><Badge className={`text-[10px] capitalize ${statusStyles[item.status]}`}>{item.status.replace('-', ' ')}</Badge></td>
                    <td className="p-4 text-xs text-muted-foreground">{item.expires}</td>
                    <td className="p-4 text-xs text-foreground">${item.cost.toFixed(2)}/{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
