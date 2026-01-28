
import { useEffect, useState } from 'react';
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
  TableRow,
} from '@/components/ui/table';
import { Battery, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  capacity: number;
  address?: string;
  created_at: string;
}

export default function StaffChargingStations() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to fetch charging stations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter stations based on search query
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (station.address && station.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Charging Stations Management</h1>
      <p className="text-muted-foreground">View and manage charging station locations</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Charging Stations</CardTitle>
          <CardDescription>
            <div className="flex justify-between items-center">
              <span>Total: {stations.length} stations</span>
              <div className="w-80">
                <Input 
                  placeholder="Search stations..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredStations.length > 0 ? (
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
                  {filteredStations.map((station) => (
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
                {searchQuery ? 'No matching stations found' : 'No charging stations to display'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
