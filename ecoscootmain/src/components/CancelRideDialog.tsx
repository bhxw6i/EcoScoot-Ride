
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CancelRideDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  bookingId: string;
  onCancellationSuccess: () => void;
}

export function CancelRideDialog({
  open,
  setOpen,
  bookingId,
  onCancellationSuccess,
}: CancelRideDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCancelRide = async () => {
    try {
      setIsSubmitting(true);
      
      // Update booking status to 'cancelled'
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Get the scooter ID from the booking to update its status
      const { data: bookingData, error: fetchError } = await supabase
        .from('bookings')
        .select('scooter_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Update scooter status back to 'available'
      if (bookingData?.scooter_id) {
        const { error: scooterError } = await supabase
          .from('scooters')
          .update({ status: 'available' })
          .eq('id', bookingData.scooter_id);

        if (scooterError) throw scooterError;
      }

      toast({
        title: "Ride cancelled",
        description: "Your ride has been successfully cancelled.",
      });
      
      setOpen(false);
      onCancellationSuccess();
      
    } catch (error: any) {
      console.error("Error cancelling ride:", error);
      toast({
        title: "Cancellation failed",
        description: error.message || "There was an error cancelling your ride. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Ride</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this ride? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            No, keep my ride
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancelRide} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, cancel ride"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
