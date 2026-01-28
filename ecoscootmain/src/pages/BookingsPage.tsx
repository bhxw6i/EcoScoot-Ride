
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { format, isPast } from "date-fns";

interface Booking {
  id: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_location: string;
  dropoff_location?: string;
  status: string;
  total_price?: number;
  scooter_id: string;
  model?: string;
}

export default function BookingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [previousBookings, setPreviousBookings] = useState<Booking[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        setUser(user);
        await fetchBookings(user.id);
      } catch (error: any) {
        console.error("Error fetching user data:", error.message);
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

  const checkAndUpdateExpiredBookings = async (bookings: Booking[], userId: string) => {
    const now = new Date();
    const expiredBookings = bookings.filter(booking => 
      (booking.status === 'active' || booking.status === 'reserved') && 
      booking.dropoff_date && 
      isPast(new Date(booking.dropoff_date))
    );
    
    // Update status of expired bookings in the database
    for (const booking of expiredBookings) {
      try {
        await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', booking.id)
          .eq('user_id', userId);
        
        console.log(`Updated booking ${booking.id} to completed status`);
      } catch (error) {
        console.error(`Failed to update booking ${booking.id}:`, error);
      }
    }
    
    // If any bookings were updated, refresh the booking lists
    if (expiredBookings.length > 0) {
      await fetchBookings(userId);
    }
  };

  const fetchBookings = async (userId: string) => {
    try {
      // Fetch active/reserved bookings
      const { data: active, error: activeError } = await supabase
        .from('bookings')
        .select(`
          id, 
          pickup_date, 
          dropoff_date, 
          pickup_location, 
          dropoff_location, 
          status, 
          total_price,
          scooter_id,
          scooters:scooter_id (model)
        `)
        .eq('user_id', userId)
        .in('status', ['active', 'reserved'])
        .order('pickup_date', { ascending: false });

      if (activeError) throw activeError;

      // Format bookings with scooter model
      const formattedActive = active?.map(booking => ({
        ...booking,
        model: booking.scooters?.model
      })) || [];
      
      // Check and update any expired bookings
      await checkAndUpdateExpiredBookings(formattedActive, userId);
      
      // After potentially updating statuses, set the current bookings
      // We'll filter out any that might have just expired
      const currentActiveBookings = formattedActive.filter(booking => 
        !booking.dropoff_date || !isPast(new Date(booking.dropoff_date))
      );
      
      setCurrentBookings(currentActiveBookings);

      // Fetch completed bookings
      const { data: completed, error: completedError } = await supabase
        .from('bookings')
        .select(`
          id, 
          pickup_date, 
          dropoff_date, 
          pickup_location, 
          dropoff_location, 
          status, 
          total_price,
          scooter_id,
          scooters:scooter_id (model)
        `)
        .eq('user_id', userId)
        .in('status', ['completed', 'cancelled'])
        .order('pickup_date', { ascending: false })
        .limit(5);

      if (completedError) throw completedError;
      
      // Format completed bookings with scooter model
      const formattedCompleted = completed?.map(booking => ({
        ...booking,
        model: booking.scooters?.model
      }));
      
      setPreviousBookings(formattedCompleted || []);

    } catch (error: any) {
      console.error("Error fetching bookings:", error.message);
      toast({
        title: "Error",
        description: "Failed to load booking data",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      return format(new Date(isoString), "PPP 'at' p"); // Format date and time
    } catch (e) {
      return "Invalid date";
    }
  };

  const renderBookingsList = (bookings: Booking[]) => {
    if (bookings.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <p>No Record Found</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-border">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-lg">{booking.model || "Scooter"}</h3>
                <p className="text-muted-foreground">Status: <span className="capitalize">{booking.status}</span></p>
              </div>
              <div className="space-y-1">
                <p><strong>Pickup:</strong> {formatDateTime(booking.pickup_date)} at {booking.pickup_location}</p>
                <p><strong>Return:</strong> {formatDateTime(booking.dropoff_date)}</p>
                {booking.total_price && (
                  <p><strong>Total:</strong> ₹{booking.total_price.toFixed(2)}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-24 flex items-center justify-center">
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-24">
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Booking Details</h1>
            <p className="text-muted-foreground">View your current and previous bookings</p>
          </div>
          
          <div className="space-y-8">
            {/* Current Bookings Section */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Current Bookings</h2>
              </div>
              {renderBookingsList(currentBookings)}
            </div>
            
            {/* Previous Bookings Section */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Previous Bookings (Last 5 Bookings)</h2>
              </div>
              {renderBookingsList(previousBookings)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
