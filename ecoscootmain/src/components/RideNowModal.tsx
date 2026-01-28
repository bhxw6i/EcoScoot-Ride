
import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client";
import { createPaymentRecord } from "@/utils/paymentUtils";
import { TimePickerSelect } from "./TimePickerSelect";
import { CardPaymentDialog, CardDetails } from "./CardPaymentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group"
import { Loader2, CreditCard, Banknote } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

interface RideNowModalProps {
  scooter: Database['public']['Tables']['scooters']['Row'];
  location: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define a type for the user data
interface UserData {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  aud?: string;
  created_at?: string;
}

const RideNowModal: React.FC<RideNowModalProps> = ({ scooter, location, open, onOpenChange }) => {
  const [pickupDateTime, setPickupDateTime] = useState<Date | undefined>(new Date());
  const [dropoffDateTime, setDropoffDateTime] = useState<Date | undefined>((() => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return date;
  })());
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedScooter, setSelectedScooter] = useState<Database['public']['Tables']['scooters']['Row']>(scooter);
  const [availableScooters, setAvailableScooters] = useState<Database['public']['Tables']['scooters']['Row'][]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([
    "Kochi"
  ]);
  const [totalPrice, setTotalPrice] = useState<number>(scooter?.hourly_rate || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingScooters, setIsLoadingScooters] = useState(false);
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [showCardPaymentDialog, setShowCardPaymentDialog] = useState(false);
  
  const fetchAvailableScooters = useCallback(async () => {
    try {
      console.log("Fetching available scooters...");
      setIsLoadingScooters(true);
      
      const { data, error } = await supabase
        .from('scooters')
        .select('*')
        .eq('status', 'available')
        .order('battery_level', { ascending: false });
      
      if (error) {
        console.error("Supabase error fetching scooters:", error);
        throw error;
      }
      
      console.log("Scooters data received:", data);
      
      if (data && Array.isArray(data)) {
        setAvailableScooters(data);
        if (data.length > 0) {
          const foundScooter = data.find(s => s.id === scooter.id);
          if (foundScooter) {
            setSelectedScooter(foundScooter);
            console.log("Found matching scooter:", foundScooter);
          } else {
            setSelectedScooter(data[0]);
            console.log("No matching scooter found, using first available:", data[0]);
          }
        } else {
          console.log("No available scooters found");
        }
      } else {
        console.log("No scooter data received or invalid format");
      }
    } catch (error) {
      console.error("Error fetching scooters:", error);
      toast({
        title: "Error",
        description: "Could not load available scooters.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingScooters(false);
    }
  }, [scooter.id, toast]);
  
  useEffect(() => {
    if (open) {
      console.log("Modal opened, checking user and fetching scooters");
      checkUser();
      fetchAvailableScooters();
      setShowAuthWarning(false);
    }
  }, [open, fetchAvailableScooters]);

  useEffect(() => {
    if (selectedScooter && pickupDateTime && dropoffDateTime) {
      const diffMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0) {
        setTotalPrice(selectedScooter.hourly_rate * diffHours);
      } else {
        setTotalPrice(selectedScooter.hourly_rate);
      }
    }
  }, [pickupDateTime, dropoffDateTime, selectedScooter]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      console.log("User authenticated:", data.session.user);
      setUserData(data.session.user as UserData);
    } else {
      console.log("No authenticated user");
      setUserData(null);
    }
  };

  const handleBooking = async () => {
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

      if (!selectedScooter) {
        toast({
          title: "No scooter selected",
          description: "Please select a scooter.",
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
    } catch (error) {
      console.error('There was an error booking the scooter:', error);
      toast({
        title: "Booking failed.",
        description: "There was an error booking the scooter. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const processBooking = async (cardDetails?: CardDetails) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userData.id,
          scooter_id: selectedScooter.id,
          start_location: selectedLocation,
          pickup_location: selectedLocation,
          dropoff_location: selectedLocation,
          status: 'reserved',
          pickup_date: pickupDateTime.toISOString(),
          dropoff_date: dropoffDateTime.toISOString(),
          total_price: totalPrice,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
      
      console.log("Booking created successfully:", data);

      if (data && userData.id) {
        const paymentStatus = paymentMethod === 'cash' ? 'pending' : 'completed';
        
        const paymentResult = await createPaymentRecord(
          data.id,
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
        title: "Booking successful!",
        description: `You have successfully booked the scooter with ${paymentMethod} payment.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('There was an error booking the scooter:', error);
      toast({
        title: "Booking failed.",
        description: "There was an error booking the scooter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Book a Scooter</AlertDialogTitle>
            <AlertDialogDescription>
              Choose from available scooters and set your ride details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid gap-4 py-4">
            {showAuthWarning && !userData && (
              <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                Please sign in to book a scooter.
              </div>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="scooter-select">Select Scooter</Label>
              <Select 
                onValueChange={(value) => {
                  const selected = availableScooters.find(s => s.id === value);
                  if (selected) setSelectedScooter(selected);
                }}
                defaultValue={selectedScooter?.id}
              >
                <SelectTrigger id="scooter-select" className="w-full">
                  <SelectValue placeholder="Select a scooter" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingScooters ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading scooters...</span>
                    </div>
                  ) : availableScooters.length > 0 ? (
                    availableScooters.map((scooter) => (
                      <SelectItem key={scooter.id} value={scooter.id}>
                        {scooter.model} (₹{scooter.hourly_rate}/hr)
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm">No scooters available</div>
                  )}
                </SelectContent>
              </Select>
            </div>

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
          
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              disabled={isLoading}
              className="bg-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Book with ${paymentMethod === 'card' ? 'Card' : 'Cash'}`
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <CardPaymentDialog
        open={showCardPaymentDialog}
        onOpenChange={setShowCardPaymentDialog}
        amount={totalPrice}
        onConfirm={handleCardPayment}
        onCancel={handleCancelCardPayment}
      />
    </>
  );
};

export default RideNowModal;
