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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import VehicleForm from '@/components/admin/VehicleForm';
import { Bike, Plus, Pencil, Battery, BatteryLow } from 'lucide-react';
import { LowBatteryScootersStaff } from './LowBatteryScootersStaff';
import { Json } from '@/integrations/supabase/types';
import { binaryToImageSrc } from '@/utils/imageUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Scooter {
  id: string;
  model: string;
  status: string;
  battery_level: number;
  battery_capacity?: string;
  max_speed?: string;
  range?: string;
  charging_time?: string;
  features?: Json;
  image_url?: string | null;
}

export default function StaffVehicles() {
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [filteredScooters, setFilteredScooters] = useState<Scooter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchScooters();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredScooters(scooters);
    } else {
      const filtered = scooters.filter(
        scooter => 
          scooter.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scooter.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scooter.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredScooters(filtered);
    }
  }, [searchTerm, scooters]);

  const fetchScooters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scooters')
        .select('*')
        .order('model', { ascending: true });
      
      if (error) throw error;
      
      setScooters(data || []);
      setFilteredScooters(data || []);
    } catch (error: any) {
      console.error("Error fetching scooters:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load scooters",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditScooter = (scooter: Scooter) => {
    setSelectedScooter(scooter);
    setIsVehicleFormOpen(true);
  };

  const handleAddNewScooter = () => {
    setSelectedScooter(null);
    setIsVehicleFormOpen(true);
  };

  const handleVehicleFormSuccess = () => {
    setIsVehicleFormOpen(false);
    fetchScooters();
  };

  const handleVehicleFormCancel = () => {
    setIsVehicleFormOpen(false);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_use':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isVehicleFormOpen) {
    return (
      <div className="p-6">
        <VehicleForm 
          vehicle={selectedScooter || undefined} 
          onSuccess={handleVehicleFormSuccess} 
          onCancel={handleVehicleFormCancel} 
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <LowBatteryScootersStaff />
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vehicle Management</CardTitle>
                <CardDescription>Manage all the vehicles in your fleet</CardDescription>
              </div>
              <Button 
                onClick={handleAddNewScooter}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search vehicles by model, ID, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredScooters.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredScooters.map((scooter) => (
                      <TableRow key={scooter.id} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={binaryToImageSrc(scooter.image_url)} 
                              alt={scooter.model} 
                            />
                            <AvatarFallback>
                              <Bike className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{scooter.model}</TableCell>
                        <TableCell>{scooter.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(scooter.status)}`}>
                            {scooter.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {scooter.battery_level < 20 ? (
                              <BatteryLow className="h-4 w-4 text-red-500" />
                            ) : (
                              <Battery className="h-4 w-4 text-green-500" />
                            )}
                            {scooter.battery_level}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditScooter(scooter)}
                            className="flex items-center gap-1"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <div className="mb-3">
                    <Bike className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <p>No vehicles found</p>
                  <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or add a new vehicle</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
