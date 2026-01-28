import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ChartBar, 
  CreditCard, 
  Users, 
  Bike, 
  Settings, 
  LogOut,
  Battery
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/admin' && location.pathname.startsWith(path));
  };

  const navigationItems = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/analytics', label: 'Analytics', icon: ChartBar },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/vehicles', label: 'Vehicle Management', icon: Bike },
    { path: '/admin/charging-stations', label: 'Charging Stations', icon: Battery },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  };

  return (
    <div className="w-64 h-screen border-r border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome, {userName}</p>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <a 
              key={item.path} 
              href={item.path}
              onClick={(e) => handleNavigation(e, item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive(item.path) 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border">
        <Button 
          variant="destructive" 
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
