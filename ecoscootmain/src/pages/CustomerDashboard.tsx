import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Route, MapPin, Bike, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChargingStations } from "@/components/admin/ChargingStations";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['customer-dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: totalRides } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      const { data: activeBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { data: completedRides } = await supabase
        .from('bookings')
        .select('start_time, end_time, cost')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const totalSpent = completedRides?.reduce((acc, ride) => acc + (ride.cost || 0), 0) || 0;
      
      return {
        totalRides: totalRides?.length || 0,
        activeBookings: activeBookings?.length || 0,
        totalSpent: totalSpent,
        completedRides: completedRides?.length || 0
      };
    }
  });

  const { data: recentRides, isLoading: isLoadingRides } = useQuery({
    queryKey: ['customer-recent-rides'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          pickup_date,
          dropoff_date,
          pickup_location,
          dropoff_location,
          status,
          total_price,
          scooters:scooter_id (model)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      return data || [];
    }
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-md dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Route className="mr-2 h-5 w-5 text-primary" />
              Total Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {isLoading ? "Loading..." : stats?.totalRides}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Active Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {isLoading ? "Loading..." : stats?.activeBookings}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              ₹{isLoading ? "Loading..." : stats?.totalSpent.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bike className="mr-2 h-5 w-5 text-primary" />
              Completed Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {isLoading ? "Loading..." : stats?.completedRides}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Rides</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate("/rides")}
            className="flex items-center gap-1"
          >
            View All
          </Button>
        </div>
        
        {isLoadingRides ? (
          <div className="text-center py-8">Loading your recent rides...</div>
        ) : recentRides && recentRides.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentRides.map((ride) => (
              <Card key={ride.id} className="bg-white shadow-md dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-primary" />
                    {ride.scooters?.model || "Scooter"}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground capitalize">
                    Status: {ride.status}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">From:</span> {ride.pickup_location}
                  </div>
                  <div>
                    <span className="font-medium">Start:</span> {formatDateTime(ride.pickup_date)}
                  </div>
                  {ride.dropoff_date && (
                    <div>
                      <span className="font-medium">End:</span> {formatDateTime(ride.dropoff_date)}
                    </div>
                  )}
                  {ride.total_price && (
                    <div>
                      <span className="font-medium">Cost:</span> ₹{ride.total_price.toFixed(2)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-md dark:bg-gray-800">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No rides found. Book your first ride now!</p>
              <Button 
                className="mt-4"
                onClick={() => navigate("/")}
              >
                Book a Ride
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Nearby Charging Stations</h2>
        <ChargingStations />
      </div>
    </div>
  );
}
