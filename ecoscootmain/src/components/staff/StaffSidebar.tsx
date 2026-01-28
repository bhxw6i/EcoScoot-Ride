
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bike,
  Battery,
  HeadphonesIcon,
  CalendarClock,
  CreditCard,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StaffSidebarProps {
  userName: string;
}

export default function StaffSidebar({ userName }: StaffSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const navItems = [
    {
      title: "Overview",
      href: "/staff",
      icon: LayoutDashboard,
    },
    {
      title: "Vehicles",
      href: "/staff/vehicles",
      icon: Bike,
    },
    {
      title: "Charging",
      href: "/staff/charging",
      icon: Battery,
    },
    {
      title: "Bookings",
      href: "/staff/bookings",
      icon: CalendarClock,
    },
    {
      title: "User Support",
      href: "/staff/users",
      icon: HeadphonesIcon,
    },
    {
      title: "Payments",
      href: "/staff/payments",
      icon: CreditCard,
    }
  ];
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You've been signed out of your account."
      });
      
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during logout';
      
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      <div className="p-6">
        <Link to="/staff" className="flex items-center gap-2 font-bold text-lg">
          <div className="h-6 w-6 rounded-full bg-primary" />
          <span>Staff Portal</span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col justify-between px-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
        
        <div className="mb-8 mt-auto flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">{userName}</div>
              <div className="text-xs text-muted-foreground">Staff Account</div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
