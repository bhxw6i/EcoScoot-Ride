
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bike, MapPin, Calendar, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CancelRideDialog } from "@/components/CancelRideDialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Scooter {
  id: string;
  model: string;
  battery_level: number;
  status: string;
  image_url?: string | null;
  max_speed?: string | null;
  range?: string | null;
}

interface Booking {
  id: string;
  scooter_id: string;
  start_time: string;
  start_location: string;
  pickup_location?: string | null;
  dropoff_location?: string | null;
  pickup_date?: string | null;
  dropoff_date?: string | null;
  end_time: string | null;
  status: string;
  total_price?: number | null;
  scooter?: Scooter;
}

export default function VehiclesPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentScooter, setCurrentScooter] = useState<Scooter | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [previousScooters, setPreviousScooters] = useState<Scooter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }
        
        setUser(user);
        await fetchVehicleData(user.id);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        setError("Failed to load user data");
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, toast]);

  const fetchVehicleData = async (userId: string) => {
    try {
      // Fetch current active booking with scooter details
      const { data: currentBookingData, error: currentBookingError } = await supabase
        .from("bookings")
        .select(`
          *,
          scooter:scooter_id (
            id,
            model,
            battery_level,
            status,
            image_url,
            max_speed,
            range
          )
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .order("start_time", { ascending: false })
        .limit(1);
      
      if (currentBookingError) {
        console.error("Error fetching current booking:", currentBookingError.message);
        setError("Failed to fetch current vehicle data");
        return;
      }
      
      console.log("Current booking data:", currentBookingData);
      
      // Set current scooter and booking if there's an active booking
      if (currentBookingData && currentBookingData.length > 0 && currentBookingData[0].scooter) {
        setCurrentScooter(currentBookingData[0].scooter);
        setCurrentBooking(currentBookingData[0]);
      }
      
      // Fetch current reserved booking with scooter details if no active booking
      if (!currentBookingData || currentBookingData.length === 0) {
        const { data: reservedBookingData, error: reservedBookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            scooter:scooter_id (
              id,
              model,
              battery_level,
              status,
              image_url,
              max_speed,
              range
            )
          `)
          .eq("user_id", userId)
          .eq("status", "reserved")
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (!reservedBookingError && reservedBookingData && reservedBookingData.length > 0) {
          setCurrentScooter(reservedBookingData[0].scooter);
          setCurrentBooking(reservedBookingData[0]);
        }
      }
      
      // Fetch previous completed bookings with scooter details
      const { data: previousBookingsData, error: previousBookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          scooter:scooter_id (
            id,
            model,
            battery_level,
            status,
            image_url,
            max_speed,
            range
          )
        `)
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("end_time", { ascending: false })
        .limit(5);
      
      if (previousBookingsError) {
        console.error("Error fetching previous bookings:", previousBookingsError.message);
        setError("Failed to fetch previous vehicle data");
        return;
      }
      
      console.log("Previous bookings data:", previousBookingsData);
      
      // Extract unique scooters from previous bookings
      const uniqueScooters = new Map<string, Scooter>();
      previousBookingsData?.forEach((booking) => {
        if (booking.scooter && !uniqueScooters.has(booking.scooter.id)) {
          uniqueScooters.set(booking.scooter.id, booking.scooter);
        }
      });
      
      setPreviousScooters(Array.from(uniqueScooters.values()));
      
    } catch (error) {
      console.error("Error fetching vehicle data:", error.message);
      setError("An unexpected error occurred while fetching vehicle data");
    }
  };

  const handleCancelBooking = () => {
    if (currentBooking) {
      setShowCancelDialog(true);
    }
  };

  const handleCancelSuccess = () => {
    setCurrentBooking(null);
    setCurrentScooter(null);
    toast({
      title: "Booking cancelled",
      description: "Your booking has been successfully cancelled.",
    });
    // Refresh data
    if (user) {
      fetchVehicleData(user.id);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP p"); // Format: Oct 12, 2023, 12:00 PM
    } catch (e) {
      return dateString;
    }
  };

  const ScooterCard = ({ scooter }: { scooter: Scooter }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {scooter.image_url ? (
            <img 
              src={scooter.image_url} 
              alt={scooter.model} 
              className="w-20 h-20 object-cover rounded-md"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
              <Bike className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-medium">{scooter.model}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Battery:</span>
                <span>{scooter.battery_level}%</span>
              </div>
              {scooter.max_speed && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Speed:</span>
                  <span>{scooter.max_speed}</span>
                </div>
              )}
              {scooter.range && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Range:</span>
                  <span>{scooter.range}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Status:</span>
                <span className={`${
                  scooter.status === 'available' ? 'text-green-500' : 
                  scooter.status === 'in_use' ? 'text-blue-500' : 'text-yellow-500'
                }`}>
                  {scooter.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CurrentBookingDetails = () => {
    if (!currentBooking || !currentScooter) return null;
    
    return (
      <div className="mt-4 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Booking Details</h3>
          <Badge variant={currentBooking.status === "active" ? "default" : "secondary"}>
            {currentBooking.status === "active" ? "In Progress" : "Reserved"}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Pickup Location</p>
              <p className="font-medium">{currentBooking.pickup_location || currentBooking.start_location}</p>
            </div>
          </div>
          
          {currentBooking.dropoff_location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Dropoff Location</p>
                <p className="font-medium">{currentBooking.dropoff_location}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Pickup Date</p>
              <p className="font-medium">{formatDateTime(currentBooking.pickup_date || currentBooking.start_time)}</p>
            </div>
          </div>
          
          {currentBooking.dropoff_date && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Dropoff Date</p>
                <p className="font-medium">{formatDateTime(currentBooking.dropoff_date)}</p>
              </div>
            </div>
          )}
          
          {currentBooking.total_price !== null && currentBooking.total_price !== undefined && (
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Total Price</p>
                <p className="font-medium">₹{currentBooking.total_price.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
        
        {currentBooking.status === "reserved" && (
          <div className="mt-4">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleCancelBooking}
              className="w-full"
            >
              Cancel Booking
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container flex-grow py-24 flex items-center justify-center">
          <p>Loading vehicles...</p>
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
        
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Vehicle Details</h1>
            <p className="text-muted-foreground">View your current and previous vehicles</p>
          </div>
          
          <div className="space-y-8">
            {/* Current Vehicle Section */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-2">
                <Bike className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Your Current Bike</h2>
              </div>
              <div className="p-4">
                {currentScooter ? (
                  <div>
                    <ScooterCard scooter={currentScooter} />
                    {currentBooking && <CurrentBookingDetails />}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No active bike rental</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Previous Vehicles Section */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-2">
                <Bike className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Previous Bikes</h2>
              </div>
              <div className="p-4">
                {previousScooters.length > 0 ? (
                  <div className="space-y-4">
                    {previousScooters.map(scooter => (
                      <ScooterCard key={scooter.id} scooter={scooter} />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No previous bike rentals</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {currentBooking && (
        <CancelRideDialog
          open={showCancelDialog}
          setOpen={setShowCancelDialog}
          bookingId={currentBooking.id}
          onCancellationSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}
