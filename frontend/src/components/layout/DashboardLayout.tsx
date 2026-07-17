import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, Leaf, ChefHat, Package, Brain,
  Store, Users, Shield, Settings, User, LogOut, Bell, Search,
  Sun, Moon, Menu, X, Heart, HandHelping,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const sidebarNav = [
  { section: 'Overview', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Sustainability', href: '/dashboard/sustainability', icon: Leaf },
  ]},
  { section: 'Operations', items: [
    { label: 'Kitchen Intel', href: '/dashboard/kitchen', icon: ChefHat },
    { label: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { label: 'AI Insights', href: '/dashboard/ai-insights', icon: Brain },
  ]},
  { section: 'Community', items: [
    { label: 'Marketplace', href: '/marketplace', icon: Store },
    { label: 'NGO Portal', href: '/ngo', icon: Heart },
    { label: 'Volunteer', href: '/volunteer', icon: HandHelping },
  ]},
  { section: 'Admin', items: [
    { label: 'Admin Panel', href: '/admin', icon: Shield },
    { label: 'User Mgmt', href: '/admin/users', icon: Users },
    { label: 'Platform Stats', href: '/admin/analytics', icon: BarChart3 },
  ]},
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-surface-1 border-r border-border transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">ZeroWaste</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-6">
            {sidebarNav.map((group) => (
              <div key={group.section}>
                {!collapsed && (
                  <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.section}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-accent/10 text-accent shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-surface-2',
                          collapsed && 'justify-center px-2'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-accent')} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User */}
        <div className="border-t border-border p-3 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-accent/20 text-accent">AJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
              <Link to="/settings">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-accent/20 text-accent">AJ</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-surface-0 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 bg-surface-1 rounded-lg px-3 py-1.5 w-64">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
              <kbd className="hidden md:inline text-[10px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Link to="/profile" className="flex items-center gap-2 hover:bg-surface-2 rounded-lg px-2 py-1 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-accent/20 text-accent">AJ</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-foreground">{user.name}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
