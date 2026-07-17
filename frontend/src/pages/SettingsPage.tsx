import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Palette, Globe, Moon, Sun } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  const sections = [
    {
      title: 'Appearance', icon: Palette, items: [
        { label: 'Dark Mode', description: 'Toggle dark/light theme', type: 'toggle' as const, value: isDark, onChange: toggleTheme },
        { label: 'Compact View', description: 'Use compact layout for tables and lists', type: 'toggle' as const, value: false },
      ],
    },
    {
      title: 'Notifications', icon: Bell, items: [
        { label: 'Email Notifications', description: 'Receive updates via email', type: 'toggle' as const, value: true },
        { label: 'Push Notifications', description: 'Browser push notifications', type: 'toggle' as const, value: true },
        { label: 'Expiry Alerts', description: 'Notify when inventory items expire', type: 'toggle' as const, value: true },
        { label: 'Order Updates', description: 'Real-time order status changes', type: 'toggle' as const, value: true },
      ],
    },
    {
      title: 'Security', icon: Shield, items: [
        { label: 'Two-Factor Authentication', description: 'Add extra security to your account', type: 'button' as const, action: 'Enable' },
        { label: 'Change Password', description: 'Update your account password', type: 'button' as const, action: 'Update' },
        { label: 'Active Sessions', description: 'Manage your logged-in devices', type: 'button' as const, action: 'View' },
      ],
    },
    {
      title: 'Preferences', icon: Globe, items: [
        { label: 'Language', description: 'English (US)', type: 'button' as const, action: 'Change' },
        { label: 'Timezone', description: 'UTC+5:30 (India Standard Time)', type: 'button' as const, action: 'Change' },
        { label: 'Currency', description: 'USD ($)', type: 'button' as const, action: 'Change' },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Customize your ZeroWaste OS experience</p>
            </div>
          </div>
        </motion.div>

        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <section.icon className="w-4 h-4 text-accent" /> {section.title}
            </h3>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.type === 'toggle' ? (
                    <button
                      onClick={item.onChange}
                      className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? 'bg-accent' : 'bg-surface-3'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${item.value ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                    </button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs rounded-lg border-border">
                      {item.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Danger Zone */}
        <motion.div className="glass-card p-6 border-red-500/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mb-4">These actions are irreversible. Please be careful.</p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg">
              Export Data
            </Button>
            <Button variant="outline" size="sm" className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg">
              Delete Account
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
