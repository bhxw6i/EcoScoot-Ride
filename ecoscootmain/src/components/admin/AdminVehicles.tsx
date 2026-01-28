
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, BatteryCharging, Wrench, MapPin, Search, Plus, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import VehicleForm from './VehicleForm';

interface ScooterData {
  id: string;
  model: string;
  battery_level: number;
  status: string;
  last_maintenance: string;
}

export default function AdminVehicles() {
  const [scooters, setScooters] = useState<ScooterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedScooter, setSelectedScooter] = useState<ScooterData | null>(null);

  useEffect(() => {
    fetchScooters();
  }, []);

  const fetchScooters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scooters')
        .select('id, model, battery_level, status, last_maintenance')
        .order('battery_level', { ascending: true });
      
      if (error) throw error;
      
      setScooters(data || []);
    } catch (error) {
      console.error("Error fetching scooters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    fetchScooters();
    setIsAddDialogOpen(false);
    setSelectedScooter(null);
  };

  const handleEditVehicle = (scooter: ScooterData) => {
    setSelectedScooter(scooter);
  };

  const filteredScooters = scooters.filter(scooter => {
    return scooter.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
           scooter.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           scooter.status.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Count scooters by status
  const availableCount = scooters.filter(s => s.status === 'available').length;
  const inUseCount = scooters.filter(s => s.status === 'in_use').length;
  const maintenanceCount = scooters.filter(s => s.status === 'maintenance').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Management</h1>
        <p className="text-muted-foreground mt-1">Monitor and maintain your scooter fleet</p>
      </header>
      
      <div className="grid gap-6 sm:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Bike className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount}</div>
            <p className="text-xs text-muted-foreground">Ready for rental</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">In Use</CardTitle>
              <MapPin className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inUseCount}</div>
            <p className="text-xs text-muted-foreground">Currently rented</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceCount}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Scooter Fleet</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scooters..."
                  className="pl-8 h-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <VehicleForm 
                    onSuccess={handleFormSuccess} 
                    onCancel={() => setIsAddDialogOpen(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredScooters.length > 0 ? (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Model</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Battery</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Maintenance</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredScooters.map((scooter) => (
                      <tr key={scooter.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{scooter.id.substring(0, 8)}...</td>
                        <td className="p-4 align-middle">{scooter.model}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <BatteryCharging className={`h-4 w-4 ${
                              scooter.battery_level < 20 ? 'text-red-500' : 
                              scooter.battery_level < 50 ? 'text-yellow-500' : 
                              'text-green-500'
                            }`} />
                            {scooter.battery_level}%
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            scooter.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            scooter.status === 'in_use' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {scooter.status}
                          </span>
                        </td>
                        <td className="p-4 align-middle">{new Date(scooter.last_maintenance).toLocaleDateString()}</td>
                        <td className="p-4 align-middle text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditVehicle(scooter)}
                              >
                                <PencilLine className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[550px]">
                              {selectedScooter && selectedScooter.id === scooter.id && (
                                <VehicleForm 
                                  vehicle={selectedScooter}
                                  onSuccess={handleFormSuccess} 
                                  onCancel={() => setSelectedScooter(null)} 
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Bike className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No scooters found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Low Battery Scooters</CardTitle>
        </CardHeader>
        <CardContent>
          {scooters.filter(s => s.battery_level < 20).length > 0 ? (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Model</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Battery</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {scooters.filter(s => s.battery_level < 20).map((scooter) => (
                      <tr key={scooter.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{scooter.id.substring(0, 8)}...</td>
                        <td className="p-4 align-middle">{scooter.model}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <BatteryCharging className="h-4 w-4 text-red-500" />
                            {scooter.battery_level}%
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            scooter.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            scooter.status === 'in_use' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {scooter.status}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <Button variant="outline" size="sm">Assign for Charging</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <BatteryCharging className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No low battery scooters found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
