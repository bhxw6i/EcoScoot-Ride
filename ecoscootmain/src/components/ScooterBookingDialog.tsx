import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { createPaymentRecord, PaymentRecord } from "@/utils/paymentUtils";
import { TimePickerSelect } from "./TimePickerSelect";
import { CardPaymentDialog, CardDetails } from "./CardPaymentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";

interface ScooterBookingDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  scooter: Tables<"scooters">;
}

interface UserData {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  aud?: string;
  created_at?: string;
}

export function ScooterBookingDialog({
  open,
  setOpen,
  scooter,
}: ScooterBookingDialogProps) {
  const [pickupDateTime, setPickupDateTime] = useState<Date | undefined>(new Date());
  const [dropoffDateTime, setDropoffDateTime] = useState<Date | undefined>((() => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return date;
  })());
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [availableLocations, setAvailableLocations] = useState<string[]>([
    "Kochi"
  ]);
  const [totalPrice, setTotalPrice] = useState<number>(scooter?.hourly_rate || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [showCardPaymentDialog, setShowCardPaymentDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkUser();
      setShowAuthWarning(false);
    }
  }, [open]);

  useEffect(() => {
    if (scooter && pickupDateTime && dropoffDateTime) {
      const diffMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0) {
        setTotalPrice(scooter.hourly_rate * diffHours);
      } else {
        setTotalPrice(scooter.hourly_rate);
      }
    }
  }, [pickupDateTime, dropoffDateTime, scooter]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      setUserData(data.session.user as UserData);
    } else {
      setUserData(null);
    }
  };

  const handleBookScooter = async () => {
    try {
      if (!userData) {
        setShowAuthWarning(true);
        toast({
          title: "Not authenticated",
          description: "Please sign in to make a booking",
          variant: "destructive",
        });
        return;
      }
      
      if (!pickupDateTime || !dropoffDateTime) {
        toast({
          title: "Missing booking details.",
          description: "Please select pickup and dropoff dates.",
          variant: "destructive",
        });
        return;
      }

      if (!selectedLocation) {
        toast({
          title: "Missing location",
          description: "Please select a location.",
          variant: "destructive",
        });
        return;
      }

      const diffMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
      if (diffMs <= 0) {
        toast({
          title: "Invalid time selection",
          description: "Drop-off time must be after pickup time.",
          variant: "destructive",
        });
        return;
      }
      
      if (paymentMethod === "card") {
        setShowCardPaymentDialog(true);
      } else {
        processBooking();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to book the scooter.";
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: errorMessage,
      });
    }
  };
  
  const processBooking = async (cardDetails?: CardDetails) => {
    try {
      setIsSubmitting(true);

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userData?.id,
          scooter_id: scooter.id,
          start_location: selectedLocation,
          pickup_location: selectedLocation,
          dropoff_location: selectedLocation,
          pickup_date: pickupDateTime?.toISOString(),
          dropoff_date: dropoffDateTime?.toISOString(),
          total_price: totalPrice,
          status: 'reserved',
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        throw bookingError;
      }
      
      console.log("Booking created successfully:", bookingData);
      
      if (bookingData && userData?.id) {
        const paymentStatus = paymentMethod === 'cash' ? 'pending' : 'completed';
        
        const paymentResult = await createPaymentRecord(
          bookingData.id,
          userData.id,
          totalPrice || 0,
          paymentMethod,
          paymentStatus,
          cardDetails
        );
        
        console.log("Payment result:", paymentResult);
        
        if (!paymentResult) {
          console.warn("Payment record creation failed or returned null");
        }
      }

      toast({
        title: paymentMethod === 'cash' ? "Booking pending payment" : "Booking successful!",
        description: paymentMethod === 'cash' 
          ? "Your booking has been created. Please pay in cash when you pick up the scooter."
          : `You have successfully booked the scooter with ${paymentMethod} payment.`,
      });
      
      setOpen(false);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to book the scooter.";
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCardPayment = (cardDetails: CardDetails) => {
    setShowCardPaymentDialog(false);
    processBooking(cardDetails);
  };
  
  const handleCancelCardPayment = () => {
    setShowCardPaymentDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book this scooter</DialogTitle>
            <DialogDescription>
              Set your ride details for {scooter.model}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {showAuthWarning && !userData && (
              <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                Please sign in to book a scooter.
              </div>
            )}
            
            <div className="space-y-1">
              <Label>Pick-Up Date & Time</Label>
              <TimePickerSelect
                value={pickupDateTime}
                onChange={setPickupDateTime}
                minDate={new Date()}
              />
            </div>

            <div className="space-y-1">
              <Label>Drop-Off Date & Time</Label>
              <TimePickerSelect
                value={dropoffDateTime}
                onChange={setDropoffDateTime}
                minDate={pickupDateTime}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="location-select">Choose Location</Label>
              <Select 
                onValueChange={setSelectedLocation}
                defaultValue={selectedLocation}
              >
                <SelectTrigger id="location-select" className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup 
                defaultValue="card" 
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="payment-card" />
                  <Label htmlFor="payment-card" className="flex items-center cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="payment-cash" />
                  <Label htmlFor="payment-cash" className="flex items-center cursor-pointer">
                    <Banknote className="mr-2 h-4 w-4" />
                    Cash
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="font-medium">Total Price:</div>
              <div className="text-lg font-bold">₹{totalPrice.toFixed(2)}</div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              onClick={handleBookScooter} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Book with ${paymentMethod === 'card' ? 'Card' : 'Cash'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <CardPaymentDialog
        open={showCardPaymentDialog}
        onOpenChange={setShowCardPaymentDialog}
        amount={totalPrice}
        onConfirm={handleCardPayment}
        onCancel={handleCancelCardPayment}
      />
    </>
  );
}
