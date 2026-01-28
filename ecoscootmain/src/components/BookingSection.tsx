import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format, addHours } from "date-fns";
import { TimePickerSelect } from "./TimePickerSelect";
import { createPaymentRecord } from "@/utils/paymentUtils";

const locations = ["Kochi"];

const LOCATION_COORDINATES = {
  "Kochi": { lat: 9.9312, lng: 76.2673 }
};

export function BookingSection() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [duration, setDuration] = useState(1);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [availableScooters, setAvailableScooters] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAvailableScootersCount() {
      try {
        const { count, error } = await supabase
          .from('scooters')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available');
          
        if (error) throw error;
        
        setAvailableScooters(count || 0);
      } catch (error) {
        console.error("Error fetching available scooters count:", error);
      }
    }
    
    fetchAvailableScootersCount();
  }, []);

  const handleBooking = async () => {
    if (!selectedLocation || !selectedDateTime) {
      toast({
        title: "Missing information",
        description: "Please select location and date/time for your booking.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to book a scooter.",
          variant: "destructive"
        });
        return;
      }

      // Get an available scooter
      const { data: availableScooter, error: scooterError } = await supabase
        .from('scooters')
        .select('id, hourly_rate')
        .eq('status', 'available')
        .limit(1)
        .single();
      
      if (scooterError) {
        toast({
          title: "No scooters available",
          description: "Sorry, there are no scooters available at this time.",
          variant: "destructive"
        });
        return;
      }

      const pickupDate = selectedDateTime;
      const dropoffDate = addHours(pickupDate, duration);
      
      const hourlyRate = availableScooter.hourly_rate || 5.99;
      const totalPrice = hourlyRate * duration;

      // Get coordinates for the selected location
      const coords = LOCATION_COORDINATES[selectedLocation];
      const pointString = `POINT(${coords.lng} ${coords.lat})`;

      // Create booking with proper point format
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          scooter_id: availableScooter.id,
          pickup_location: selectedLocation,
          pickup_date: pickupDate.toISOString(),
          dropoff_date: dropoffDate.toISOString(),
          duration: duration,
          total_price: totalPrice,
          status: 'reserved',
          start_location: pointString
        })
        .select()
        .single();

      if (bookingError) throw bookingError;
      
      console.log("Booking created successfully:", bookingData);

      // Create payment record
      if (bookingData) {
        const paymentResult = await createPaymentRecord(
          bookingData.id,
          user.id,
          totalPrice,
          'card', // Default to card payment for this flow
          'completed'
        );
        
        console.log("Payment record created:", paymentResult);
      }

      // Update scooter status
      await supabase
        .from('scooters')
        .update({ status: 'reserved' })
        .eq('id', availableScooter.id);

      toast({
        title: "Booking confirmed",
        description: `Your scooter has been booked at ${selectedLocation} for ${duration} hour${duration !== 1 ? 's' : ''} starting at ${format(pickupDate, "PPP 'at' HH:00")}.`,
      });

      // Reset form
      setSelectedLocation("");
      setSelectedDateTime(new Date());
      setDuration(1);
      
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "There was an error processing your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="booking" className="py-24 bg-secondary/50 dark:bg-gray-900/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Book Your Ride</h2>
          <p className="text-foreground/70 text-lg">
            Ready to hit the road? Book your scooter in just a few steps.
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-morphism rounded-3xl overflow-hidden border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10 space-y-8">
              <h3 className="text-2xl font-bold">Reservation Details</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Select Location</label>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <TimePickerSelect 
                value={selectedDateTime}
                onChange={setSelectedDateTime}
                label="Select Date & Time"
                className="w-full"
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-foreground/40" />
                  <input 
                    type="number" 
                    min="1" 
                    max="24"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleBooking}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Continue to Booking"}
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0,_transparent_100%)]"></div>
              </div>
              <div className="relative h-full p-8 md:p-10 flex flex-col justify-between text-white">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Your Ride Summary</h3>
                  <p className="opacity-80">Experience the freedom of exploring the city on your own terms.</p>
                  <p className="text-sm opacity-80">
                    <strong>Available Scooters:</strong> {availableScooters}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span>Location</span>
                    <span className="font-medium">
                      {selectedLocation || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span>Start Time</span>
                    <span className="font-medium">
                      {selectedDateTime ? format(selectedDateTime, "MMM dd 'at' HH:00") : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span>Duration</span>
                    <span className="font-medium">{duration} hour{duration !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Price</span>
                    <span className="font-bold text-xl">₹{(5.99 * duration).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
