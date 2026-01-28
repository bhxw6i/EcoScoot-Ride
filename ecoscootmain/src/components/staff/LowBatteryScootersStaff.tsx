
import { useEffect, useState } from 'react';
import { BatteryCharging } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface ScooterData {
  id: string;
  model: string;
  battery_level: number;
  status: string;
}

export function LowBatteryScootersStaff() {
  const [scooters, setScooters] = useState<ScooterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLowBatteryScooters();
  }, []);

  const fetchLowBatteryScooters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scooters')
        .select('id, model, battery_level, status')
        .lt('battery_level', 20)
        .order('battery_level', { ascending: true });
      
      if (error) throw error;
      
      setScooters(data || []);
    } catch (error) {
      console.error("Error fetching low battery scooters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const assignForCharging = async (scooterId: string) => {
    try {
      setIsUpdating(scooterId);
      
      const { error } = await supabase
        .from('scooters')
        .update({ status: 'maintenance' })
        .eq('id', scooterId);
      
      if (error) throw error;
      
      // Update local state to reflect the change
      setScooters(prev => 
        prev.map(scooter => 
          scooter.id === scooterId 
            ? { ...scooter, status: 'maintenance' } 
            : scooter
        )
      );
      
      toast({
        title: "Scooter assigned",
        description: "Scooter has been assigned for charging",
      });
    } catch (error: any) {
      console.error("Error assigning scooter for charging:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign scooter for charging",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Low Battery Scooters</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : scooters.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scooters.map((scooter) => (
                  <TableRow key={scooter.id} className="border-b transition-colors hover:bg-muted/50">
                    <TableCell>{scooter.id.substring(0, 8)}...</TableCell>
                    <TableCell>{scooter.model}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BatteryCharging className="h-4 w-4 text-red-500" />
                        {scooter.battery_level}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        scooter.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        scooter.status === 'in_use' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {scooter.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {scooter.status !== 'maintenance' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => assignForCharging(scooter.id)}
                          disabled={isUpdating === scooter.id}
                        >
                          {isUpdating === scooter.id ? (
                            <>
                              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Assigning...
                            </>
                          ) : (
                            'Assign for Charging'
                          )}
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Already assigned</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="py-6 text-center text-sm text-muted-foreground">
              <div className="mb-2">
                <BatteryCharging className="mx-auto h-12 w-12 text-muted-foreground/50" />
              </div>
              No low battery scooters to display
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
