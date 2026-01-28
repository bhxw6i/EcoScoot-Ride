
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Calendar, Clock, Navigation, CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CancelRideDialog } from "@/components/CancelRideDialog";

interface Booking {
  id: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_location: string;
  dropoff_location: string | null;
  status: string;
  total_price: number | null;
  scooter_id: string;
  scooters?: {
    model: string;
  };
  created_at: string;
}

export default function RidesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRide, setCurrentRide] = useState<Booking | null>(null);
  const [previousRides, setPreviousRides] = useState<Booking[]>([]);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRideData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }
        
        await fetchRides(user.id);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        setError("Failed to fetch user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRideData();
  }, [navigate]);

  const fetchRides = async (userId: string) => {
    try {
      // Fetch current active or reserved ride
      const { data: currentRideData, error: currentRideError } = await supabase
        .from("bookings")
        .select(`
          id, 
          pickup_date, 
          dropoff_date, 
          pickup_location, 
          dropoff_location, 
          status, 
          total_price,
          scooter_id,
          created_at,
          scooters:scooter_id (model)
        `)
        .eq("user_id", userId)
        .in("status", ["active", "reserved"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (currentRideError) {
        console.error("Error fetching current ride:", currentRideError.message);
        toast({
          title: "Error",
          description: "Failed to fetch current ride data",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Current ride data:", currentRideData);
      setCurrentRide(currentRideData);
      
      // Fetch previous completed or cancelled rides (last 5)
      const { data: previousRidesData, error: previousRidesError } = await supabase
        .from("bookings")
        .select(`
          id, 
          pickup_date, 
          dropoff_date, 
          pickup_location, 
          dropoff_location, 
          status, 
          total_price,
          scooter_id,
          created_at,
          scooters:scooter_id (model)
        `)
        .eq("user_id", userId)
        .in("status", ["completed", "cancelled"])
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (previousRidesError) {
        console.error("Error fetching previous rides:", previousRidesError.message);
        toast({
          title: "Error",
          description: "Failed to fetch previous ride data",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Previous rides data:", previousRidesData);
      setPreviousRides(previousRidesData || []);
    } catch (error) {
      console.error("Error fetching rides:", error.message);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const handleCancelRide = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsCancelDialogOpen(true);
  };

  const handleCancellationSuccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Refresh the rides data
        await fetchRides(user.id);
      }
    } catch (error) {
      console.error("Error refreshing rides data:", error);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const RideCard = ({ ride }: { ride: Booking }) => {
    const isCurrentRide = ride.status === 'active' || ride.status === 'reserved';
    
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Start: {formatDateTime(ride.pickup_date)}
                </span>
              </div>
              {ride.dropoff_date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    End: {formatDateTime(ride.dropoff_date)}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Start Location: {ride.pickup_location || "N/A"}
                </span>
              </div>
              {ride.dropoff_location && (
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    End Location: {ride.dropoff_location}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm font-medium">
              Status: <span className={`
                ${ride.status === 'active' ? 'text-green-500' : 
                ride.status === 'completed' ? 'text-blue-500' : 
                ride.status === 'cancelled' ? 'text-red-500' : 
                'text-yellow-500'}
              `}>
                {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
              </span>
            </span>
            {ride.total_price && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Cost: ₹{ride.total_price.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {ride.scooters && (
            <div className="mt-2">
              <span className="text-sm font-medium">Scooter: {ride.scooters.model}</span>
            </div>
          )}
          
          {/* Add Cancel button for active or reserved rides */}
          {isCurrentRide && (
            <div className="mt-4">
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto flex items-center gap-2"
                onClick={() => handleCancelRide(ride.id)}
              >
                <XCircle className="h-4 w-4" />
                Cancel Ride
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container flex-grow py-24 flex items-center justify-center">
          <p>Loading ride details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container flex-grow py-24 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container flex-grow py-24">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Ride Details</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Ride</h2>
            {currentRide ? (
              <RideCard ride={currentRide} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No active rides found</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Previous Rides</h2>
            {previousRides.length > 0 ? (
              <div className="space-y-4">
                {previousRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No previous rides found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Cancel Ride Dialog */}
      <CancelRideDialog 
        open={isCancelDialogOpen}
        setOpen={setIsCancelDialogOpen}
        bookingId={selectedBookingId}
        onCancellationSuccess={handleCancellationSuccess}
      />
    </div>
  );
}
