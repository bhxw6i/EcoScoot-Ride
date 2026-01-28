
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
import { Input } from "@/components/ui/input";
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
import { Payment } from "../staff/user-support/types";

interface PaymentWithProfile extends Payment {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

interface PaymentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPayment: PaymentWithProfile | null;
  onSuccess: () => void;
}

// Define proper type for payment update data
interface PaymentUpdateData {
  status: string;
  payment_method?: string;
}

export default function PaymentStatusDialog({ 
  open, 
  onOpenChange,
  selectedPayment,
  onSuccess
}: PaymentStatusDialogProps) {
  const [newStatus, setNewStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [processingUpdate, setProcessingUpdate] = useState(false);
  
  const { toast } = useToast();

  // Initialize the state when the dialog opens with a new payment
  useState(() => {
    if (selectedPayment) {
      setNewStatus(selectedPayment.status);
      setPaymentMethod(selectedPayment.payment_method);
    }
  });

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      setProcessingUpdate(true);
      
      const updateData: PaymentUpdateData = {
        status: newStatus,
      };
      
      // Only update payment method if it changed
      if (paymentMethod !== selectedPayment.payment_method) {
        updateData.payment_method = paymentMethod;
      }
      
      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', selectedPayment.id);
      
      if (error) throw error;
      
      if (selectedPayment.booking_id && newStatus === 'completed') {
        // Update booking status to completed if the payment is completed
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', selectedPayment.booking_id);
        
        if (bookingError) {
          console.error("Error updating booking status:", bookingError);
          toast({
            title: "Payment updated but booking status update failed",
            description: `The payment was updated but we couldn't update the booking status.`,
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Payment updated",
        description: `Payment status changed to ${newStatus}.`,
      });
      
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating payment';
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      onOpenChange(false);
      setProcessingUpdate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Payment</DialogTitle>
          <DialogDescription>
            Change payment status, method, or transaction details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-status" className="text-right">
              Status
            </Label>
            <Select 
              value={newStatus} 
              onValueChange={setNewStatus}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-method" className="text-right">
              Method
            </Label>
            <Select 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
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
            onClick={handleUpdatePayment}
            disabled={processingUpdate}
          >
            {processingUpdate ? (
              <>Processing...</>
            ) : (
              <>Update Payment</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
