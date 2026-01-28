
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LowBatteryScootersStaff } from './LowBatteryScootersStaff';
import { Bike, UserCheck, Wrench, BatteryCharging } from 'lucide-react';

export default function StaffOverview() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    lowBatteryVehicles: 0,
    inMaintenanceVehicles: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total vehicles count
      const { count: totalVehicles, error: totalError } = await supabase
        .from('scooters')
        .select('*', { count: 'exact', head: true });
        
      if (totalError) throw totalError;
      
      // Fetch available vehicles count
      const { count: availableVehicles, error: availableError } = await supabase
        .from('scooters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');
        
      if (availableError) throw availableError;

      // Fetch low battery vehicles count
      const { count: lowBatteryVehicles, error: lowBatteryError } = await supabase
        .from('scooters')
        .select('*', { count: 'exact', head: true })
        .lt('battery_level', 20);
        
      if (lowBatteryError) throw lowBatteryError;
      
      // Fetch maintenance vehicles count
      const { count: inMaintenanceVehicles, error: maintenanceError } = await supabase
        .from('scooters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'maintenance');
        
      if (maintenanceError) throw maintenanceError;
      
      setStats({
        totalVehicles: totalVehicles || 0,
        availableVehicles: availableVehicles || 0,
        lowBatteryVehicles: lowBatteryVehicles || 0,
        inMaintenanceVehicles: inMaintenanceVehicles || 0
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-7 w-16 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Vehicles</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-7 w-16 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.availableVehicles}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Battery</CardTitle>
            <BatteryCharging className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-7 w-16 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.lowBatteryVehicles}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-7 w-16 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.inMaintenanceVehicles}</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <LowBatteryScootersStaff />
      </div>
    </div>
  );
}
