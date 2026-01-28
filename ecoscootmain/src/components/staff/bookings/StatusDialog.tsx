
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface Booking {
  id: string;
  user_id: string;
  scooter_id: string;
  start_time: string;
  end_time: string | null;
  status: BookingStatus;
  cost: number | null;
  start_location: string;
  total_price: number | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
  scooter_model?: string;
}

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooking: Booking | null;
  onSuccess: () => void;
}

export default function StatusDialog({ 
  open, 
  onOpenChange,
  selectedBooking,
  onSuccess
}: StatusDialogProps) {
  const [newStatus, setNewStatus] = useState<BookingStatus>("active");
  const [processingStatus, setProcessingStatus] = useState(false);
  
  const { toast } = useToast();

  const handleUpdateStatus = async () => {
    if (!selectedBooking || selectedBooking.status === newStatus) {
      onOpenChange(false);
      return;
    }
    
    try {
      setProcessingStatus(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Booking status changed to ${newStatus}.`,
      });
      
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating status';
      toast({
        title: "Status update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      onOpenChange(false);
      setProcessingStatus(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Booking Status</DialogTitle>
          <DialogDescription>
            Change the current status of this booking.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-status" className="text-right">
              Current
            </Label>
            <div className="col-span-3 text-sm font-medium">
              {selectedBooking?.status || 'Unknown'}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-status" className="text-right">
              New Status
            </Label>
            <Select 
              value={newStatus} 
              onValueChange={(value) => setNewStatus(value as BookingStatus)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleUpdateStatus}
            disabled={processingStatus || (selectedBooking && selectedBooking.status === newStatus)}
          >
            {processingStatus ? (
              <>Processing...</>
            ) : (
              <>Update Status</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
