import { motion } from 'framer-motion';
import { Heart, Package, MapPin, Clock, CheckCircle2, Calendar, Truck, Users } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const donations = [
  { id: '1', items: 'Mixed Rice & Curry (50 portions)', donor: 'The Grand Kitchen', address: '123 Main St, Downtown', distance: '2.3 km', expiry: '6 hours', status: 'pending', weight: '25 kg', meals: 50 },
  { id: '2', items: 'Assorted Bread & Pastries', donor: 'Urban Crust Bakery', address: '456 Oak Ave, Midtown', distance: '1.1 km', expiry: '12 hours', status: 'pending', weight: '15 kg', meals: 30 },
  { id: '3', items: 'Fresh Fruit Boxes (20 boxes)', donor: 'Sunrise Farms', address: '789 Farm Rd, Eastside', distance: '4.5 km', expiry: '2 days', status: 'accepted', weight: '40 kg', meals: 80 },
  { id: '4', items: 'Vegetable Biryani (30 portions)', donor: 'Spice Route Restaurant', address: '321 Spice Lane', distance: '0.8 km', expiry: '4 hours', status: 'picked-up', weight: '18 kg', meals: 30 },
  { id: '5', items: 'Dairy Products Bundle', donor: 'Fresh Valley Dairy', address: '567 Green Blvd', distance: '3.2 km', expiry: '1 day', status: 'delivered', weight: '30 kg', meals: 45 },
];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  accepted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'picked-up': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const stats = [
  { label: 'Available', value: '12', icon: Package, color: 'text-amber-400' },
  { label: 'Accepted', value: '5', icon: CheckCircle2, color: 'text-blue-400' },
  { label: 'In Transit', value: '3', icon: Truck, color: 'text-violet-400' },
  { label: 'Delivered', value: '847', icon: Heart, color: 'text-emerald-400' },
];

export default function NGOPortalPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? donations : donations.filter((d) => d.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">NGO Portal</h1>
              <p className="text-sm text-muted-foreground">Manage food donations and redistribute to communities</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
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

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'pending', 'accepted', 'picked-up', 'delivered'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-accent text-white' : 'bg-surface-2 text-muted-foreground hover:text-foreground'}`}>
              {f === 'all' ? 'All Donations' : f.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Donations List */}
        <div className="space-y-4">
          {filtered.map((donation, i) => (
            <motion.div key={donation.id} className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-foreground">{donation.items}</h3>
                    <Badge className={`text-[10px] ${statusColors[donation.status]}`}>{donation.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">From: {donation.donor}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {donation.distance}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Expires in {donation.expiry}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {donation.weight}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> ~{donation.meals} meals</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {donation.status === 'pending' && (
                    <>
                      <Button size="sm" className="bg-accent text-white rounded-lg text-xs">Accept</Button>
                      <Button size="sm" variant="outline" className="rounded-lg text-xs border-border">Details</Button>
                    </>
                  )}
                  {donation.status === 'accepted' && (
                    <Button size="sm" className="bg-violet-500 text-white rounded-lg text-xs gap-1">
                      <Calendar className="w-3 h-3" /> Schedule Pickup
                    </Button>
                  )}
                  {donation.status === 'picked-up' && (
                    <Button size="sm" className="bg-emerald-500 text-white rounded-lg text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Mark Delivered
                    </Button>
                  )}
                  {donation.status === 'delivered' && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Completed ✓</Badge>
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
