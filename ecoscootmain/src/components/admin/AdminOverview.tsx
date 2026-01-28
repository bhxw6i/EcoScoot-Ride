
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Bike, CreditCard, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { StatCard } from './StatCard';
import { RecentBookings } from './RecentBookings';
import { LowBatteryScooters } from './LowBatteryScooters';
import { ChargingStations } from './ChargingStations';
import { DashboardSkeleton } from './DashboardSkeleton';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OverviewStat {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  link?: string;
}

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OverviewStat[]>([
    { 
      title: 'Total Rides', 
      value: '0', 
      icon: Activity,
      color: 'text-blue-500'
    },
    { 
      title: 'Number of Users', 
      value: '0', 
      icon: Users,
      color: 'text-green-500',
      link: '/admin/users'
    },
    { 
      title: 'Revenue Generated', 
      value: '₹0', 
      icon: CreditCard,
      color: 'text-yellow-500'
    },
    { 
      title: 'Available Scooters', 
      value: '0', 
      icon: Bike,
      color: 'text-purple-500'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  const today = format(new Date(), 'MMMM d, yyyy');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get total rides (all bookings)
        const { count: ridesCount, error: ridesError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact' });
        
        if (ridesError) throw ridesError;
        
        // Get total number of users with role_id = 1 (customers) from profiles table
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role_id', 1);
        
        if (usersError) throw usersError;

        const usersCount = usersData ? usersData.length : 0;
        
        // Get available scooters
        const { count: availableScooters, error: scootersError } = await supabase
          .from('scooters')
          .select('*', { count: 'exact' })
          .eq('status', 'available');
        
        if (scootersError) throw scootersError;
        
        // Get total scooters
        const { count: totalScooters, error: totalScootersError } = await supabase
          .from('scooters')
          .select('*', { count: 'exact' });
        
        if (totalScootersError) throw totalScootersError;
        
        // Calculate total revenue from payments table
        const { data: revenueData, error: revenueError } = await supabase
          .from('payments')
          .select('amount');
        
        if (revenueError) throw revenueError;
        
        let totalRevenue = 0;
        if (revenueData) {
          totalRevenue = revenueData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        }
        
        // Update stats with real data
        setStats([
          { 
            title: 'Total Rides', 
            value: ridesCount || 0, 
            icon: Activity,
            color: 'text-primary'
          },
          { 
            title: 'Number of Users', 
            value: usersCount,
            icon: Users,
            color: 'text-green-500',
            link: '/admin/users'
          },
          { 
            title: 'Revenue Generated', 
            value: `₹${totalRevenue.toFixed(2)}`, 
            icon: CreditCard,
            color: 'text-accent'
          },
          { 
            title: 'Available Scooters', 
            value: `${availableScooters || 0}/${totalScooters || 0}`, 
            icon: Bike,
            color: 'text-purple-500'
          }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleStatCardClick = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome to the admin dashboard. Here's what's happening today, {today}.</p>
      </header>
      
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                onClick={() => handleStatCardClick(stat.link)}
                clickable={!!stat.link}
              />
            ))}
          </div>
          
          <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
            <RecentBookings />
            <div className="grid gap-6 grid-cols-1">
              <LowBatteryScooters />
              <ChargingStations />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
