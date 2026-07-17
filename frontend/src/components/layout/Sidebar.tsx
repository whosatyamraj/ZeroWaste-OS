import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Store, 
  Users, 
  Settings, 
  Leaf,
  LogOut,
  Brain,
  PackageSearch
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearAuth } from '@/store/slices/authSlice';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  const getLinks = () => {
    const role = user?.role as UserRole;
    const baseLinks = [
      { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { name: 'Marketplace', to: '/marketplace', icon: Store },
    ];

    if (role === UserRole.FoodBusinessOwner || role === UserRole.Admin) {
      baseLinks.push(
        { name: 'Inventory', to: '/dashboard/inventory', icon: PackageSearch },
        { name: 'AI Forecasts', to: '/dashboard/ai-insights', icon: Brain },
        { name: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 }
      );
    }

    if (role === UserRole.Admin) {
      baseLinks.push({ name: 'User Management', to: '/admin/users', icon: Users });
    }

    return baseLinks;
  };

  const links = getLinks();

  const sidebarClasses = cn(
    "w-64 bg-card border-r border-border h-full flex flex-col transition-transform duration-300 z-40",
    "md:translate-x-0 md:static fixed inset-y-0 left-0",
    mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen?.(false)}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Leaf className="w-5 h-5 text-primary mr-2" />
          <span className="font-bold text-lg text-foreground tracking-tight">ZeroWaste OS</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={() => setMobileOpen?.(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-border space-y-1">
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen?.(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-danger hover:bg-danger/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
