import { motion } from 'framer-motion';
import { Shield, Users, CheckCircle2, XCircle, BarChart3, Eye, Ban, UserCheck, Search, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const users = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@grandkitchen.com', role: 'FoodBusinessOwner', status: 'active', verified: true, joined: '2024-01-15', listings: 24, donations: 12 },
  { id: '2', name: 'Rajesh Patel', email: 'rajesh@freshbites.com', role: 'FoodBusinessOwner', status: 'active', verified: true, joined: '2024-02-20', listings: 18, donations: 8 },
  { id: '3', name: 'Maria Lopez', email: 'maria@feedforward.org', role: 'NGOPartner', status: 'active', verified: true, joined: '2024-03-10', listings: 0, donations: 156 },
  { id: '4', name: 'James Wilson', email: 'james@volunteer.com', role: 'Volunteer', status: 'active', verified: true, joined: '2024-04-05', listings: 0, donations: 0 },
  { id: '5', name: 'Aisha Khan', email: 'aisha@community.org', role: 'NGOPartner', status: 'pending', verified: false, joined: '2024-06-01', listings: 0, donations: 0 },
  { id: '6', name: 'Tom Brown', email: 'tom@user.com', role: 'Customer', status: 'suspended', verified: true, joined: '2024-05-15', listings: 0, donations: 0 },
];

const platformStats = [
  { label: 'Total Users', value: '1,247', icon: Users, color: 'text-blue-400' },
  { label: 'Active Businesses', value: '89', icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Verified NGOs', value: '34', icon: UserCheck, color: 'text-violet-400' },
  { label: 'Reports', value: '7', icon: BarChart3, color: 'text-amber-400' },
];

const roleColors: Record<string, string> = {
  FoodBusinessOwner: 'bg-blue-500/10 text-blue-400',
  NGOPartner: 'bg-pink-500/10 text-pink-400',
  Volunteer: 'bg-violet-500/10 text-violet-400',
  Customer: 'bg-emerald-500/10 text-emerald-400',
  Admin: 'bg-amber-500/10 text-amber-400',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  suspended: 'bg-red-500/10 text-red-400',
};

export default function AdminPanelPage() {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage users, verify NGOs, and monitor platform activity</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((stat, i) => (
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-1 border-border rounded-xl" />
        </div>

        {/* Users Table */}
        <motion.div className="glass-card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">User</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Role</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Joined</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Activity</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-[10px] ${roleColors[user.role]}`}>{user.role}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-[10px] capitalize ${statusColors[user.status]}`}>{user.status}</Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{user.joined}</td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {user.listings > 0 && <span>{user.listings} listings</span>}
                      {user.donations > 0 && <span>{user.donations} donations</span>}
                      {user.listings === 0 && user.donations === 0 && <span>—</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                        {!user.verified && user.role === 'NGOPartner' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400"><UserCheck className="w-3.5 h-3.5" /></Button>
                        )}
                        {user.status === 'active' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400"><Ban className="w-3.5 h-3.5" /></Button>
                        )}
                        {user.status === 'suspended' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /></Button>
                        )}
                      </div>
                    </td>
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
