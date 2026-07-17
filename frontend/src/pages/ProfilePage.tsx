import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Building2, Shield, Camera } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </motion.div>

        {/* Avatar */}
        <motion.div className="glass-card p-6 flex items-center gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white shadow-lg">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.role}</p>
            <p className="text-xs text-accent mt-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Verified Account</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div className="glass-card p-6 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-foreground mb-2">Personal Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><User className="w-3 h-3" /> First Name</Label>
              <Input defaultValue="Alex" className="bg-surface-1 border-border rounded-lg" /></div>
            <div><Label className="text-xs text-muted-foreground mb-1">Last Name</Label>
              <Input defaultValue="Johnson" className="bg-surface-1 border-border rounded-lg" /></div>
            <div><Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
              <Input defaultValue="alex@grandkitchen.com" className="bg-surface-1 border-border rounded-lg" /></div>
            <div><Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
              <Input defaultValue="+1 555-0123" className="bg-surface-1 border-border rounded-lg" /></div>
            <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</Label>
              <Input defaultValue="123 Main Street, Downtown" className="bg-surface-1 border-border rounded-lg" /></div>
            <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> Organization</Label>
              <Input defaultValue="The Grand Kitchen" className="bg-surface-1 border-border rounded-lg" /></div>
          </div>
          <div className="flex justify-end pt-2">
            <Button className="bg-accent text-white rounded-xl">Save Changes</Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
