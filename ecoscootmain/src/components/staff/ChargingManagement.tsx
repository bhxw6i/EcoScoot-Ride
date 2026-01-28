
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StaffChargingStations from "./StaffChargingStations";
import { LowBatteryScootersStaff } from "./LowBatteryScootersStaff";

export default function ChargingManagement() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Charging Management</h1>
      <p className="text-muted-foreground">
        View and manage charging stations and monitor scooter battery levels
      </p>
      
      <Tabs defaultValue="stations" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="stations">Charging Stations</TabsTrigger>
          <TabsTrigger value="low-battery">Low Battery Scooters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stations" className="mt-6">
          <StaffChargingStations />
        </TabsContent>
        
        <TabsContent value="low-battery" className="mt-6">
          <LowBatteryScootersStaff />
        </TabsContent>
      </Tabs>
    </div>
  );
}
