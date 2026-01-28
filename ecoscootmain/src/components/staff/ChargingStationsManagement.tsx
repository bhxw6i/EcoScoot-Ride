import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Battery, MapPin } from 'lucide-react';

interface ChargingStation {
  id: string;
  name: string;
  location: string; // Now a text field
  capacity: number;
  address?: string;
  created_at: string;
}

export default function ChargingStationsManagement() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChargingStations();
  }, []);

  const fetchChargingStations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setStations(data || []);
    } catch (error) {
      console.error("Error fetching charging stations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Charging Stations in Kochi</CardTitle>
          <CardDescription>View and manage charging station locations across Kochi</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : stations.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stations.map((station) => (
                    <TableRow key={station.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {station.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Battery className="h-4 w-4 mr-2 text-green-500" />
                          {station.capacity} scooters
                        </div>
                      </TableCell>
                      <TableCell>
                        {station.location || 'Location not set'}
                      </TableCell>
                      <TableCell>
                        {station.address || 'Address not provided'}
                      </TableCell>
                      <TableCell>
                        {new Date(station.created_at).toLocaleDateString()}
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
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                </div>
                No charging stations to display
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
