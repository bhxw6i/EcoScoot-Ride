
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
import { 
  Battery, 
  MapPin, 
  Plus, 
  PencilLine, 
  Trash2, 
  X, 
  Check,
  Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ChargingStation {
  id: string;
  name: string;
  address: string;
  location: string; // Now a text field
  capacity: number;
  created_at?: string;
}

export default function AdminChargingStations() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newStation, setNewStation] = useState<Omit<ChargingStation, 'id' | 'created_at'>>({
    name: '',
    address: '',
    location: '',
    capacity: 1,
  });
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
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
      
      // Transform data to match the ChargingStation interface by adding the address property
      const transformedData = data?.map(station => ({
        ...station,
        address: station.address || '' // Add address if missing
      })) || [];
      
      setStations(transformedData as ChargingStation[]);
    } catch (error: any) {
      console.error("Error fetching charging stations:", error.message);
      toast({
        title: "Error",
        description: `Failed to fetch charging stations: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'capacity') {
      setNewStation(prevState => ({ ...prevState, [name]: parseInt(value, 10) }));
    } else {
      setNewStation(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleCreateStation = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('charging_stations')
        .insert([
          { 
            name: newStation.name, 
            address: newStation.address,
            location: newStation.location,
            capacity: newStation.capacity 
          }
        ]);
      
      if (error) throw error;
      
      fetchChargingStations();
      setOpen(false);
      setNewStation({ name: '', address: '', location: '', capacity: 1 });
      toast({
        title: "Success",
        description: "Charging station created successfully.",
      });
    } catch (error: any) {
      console.error("Error creating charging station:", error.message);
      toast({
        title: "Error",
        description: `Failed to create charging station: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedStation(prevState => {
      if (!prevState) return prevState;
      
      if (name === 'capacity') {
        return { ...prevState, [name]: parseInt(value, 10) };
      }
      return { ...prevState, [name]: value };
    });
  };

  const handleUpdateStation = async () => {
    if (!selectedStation) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('charging_stations')
        .update({ 
          name: selectedStation.name,
          address: selectedStation.address,
          location: selectedStation.location,
          capacity: selectedStation.capacity
        })
        .eq('id', selectedStation.id);
      
      if (error) throw error;
      
      fetchChargingStations();
      setEditOpen(false);
      setSelectedStation(null);
      toast({
        title: "Success",
        description: "Charging station updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating charging station:", error.message);
      toast({
        title: "Error",
        description: `Failed to update charging station: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStation = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('charging_stations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchChargingStations();
      toast({
        title: "Success",
        description: "Charging station deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting charging station:", error.message);
      toast({
        title: "Error",
        description: `Failed to delete charging station: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle>Charging Stations</CardTitle>
          <CardDescription>Manage charging station locations</CardDescription>
          <Button variant="default" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Station
          </Button>
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
                    <TableHead>Address</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stations.map((station) => (
                    <TableRow key={station.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Battery className="h-4 w-4 mr-2 text-primary" />
                          {station.name}
                        </div>
                      </TableCell>
                      <TableCell>{station.address}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Battery className="h-4 w-4 mr-2 text-green-500" />
                          {station.capacity} scooters
                        </div>
                      </TableCell>
                      <TableCell>
                        {station.location || 'Location not set'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedStation(station);
                            setEditOpen(true);
                          }}
                        >
                          <PencilLine className="h-4 w-4 mr-2" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStation(station.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
                  <Battery className="mx-auto h-12 w-12 text-muted-foreground/50" />
                </div>
                No charging stations to display
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Station Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Charging Station</DialogTitle>
            <DialogDescription>
              Create a new charging station.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input type="text" id="name" name="name" value={newStation.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input type="text" id="address" name="address" value={newStation.address} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input type="text" id="location" name="location" value={newStation.location} onChange={handleInputChange} className="col-span-3" placeholder="e.g. 12.9716, 77.5946" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Capacity
              </Label>
              <Input type="number" id="capacity" name="capacity" value={newStation.capacity} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleCreateStation} disabled={isLoading}>
              {isLoading ? (
                <>
                  Creating <Loader className="animate-spin h-4 w-4 ml-2" />
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Station Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Charging Station</DialogTitle>
            <DialogDescription>
              Edit the details of the selected charging station.
            </DialogDescription>
          </DialogHeader>
          {selectedStation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input type="text" id="name" name="name" value={selectedStation.name} onChange={handleEditInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input type="text" id="address" name="address" value={selectedStation.address} onChange={handleEditInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input type="text" id="location" name="location" value={selectedStation.location} onChange={handleEditInputChange} className="col-span-3" placeholder="e.g. 12.9716, 77.5946" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacity
                </Label>
                <Input type="number" id="capacity" name="capacity" value={selectedStation.capacity} onChange={handleEditInputChange} className="col-span-3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdateStation} disabled={isLoading}>
              {isLoading ? (
                <>
                  Updating <Loader className="animate-spin h-4 w-4 ml-2" />
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
