
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
import { Database } from "@/integrations/supabase/types";

interface Booking {
  id: string;
  user_id: string;
  scooter_id: string;
  start_time: string;
  end_time: string | null;
  status: Database["public"]["Enums"]["booking_status"];
  cost: number | null;
  start_location: string;
  total_price: number | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
  scooter_model?: string;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooking: Booking | null;
  onSuccess: () => void;
  formatCurrency: (amount: number | null) => string;
}

export default function PaymentDialog({ 
  open, 
  onOpenChange,
  selectedBooking,
  onSuccess,
  formatCurrency
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [transactionId, setTransactionId] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const { toast } = useToast();

  const handleProcessPayment = async () => {
    if (!selectedBooking) return;
    
    try {
      setProcessingPayment(true);
      
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', selectedBooking.id)
        .eq('payment_type', 'payment');
      
      if (checkError) throw checkError;
      
      if (existingPayment && existingPayment.length > 0) {
        toast({
          title: "Payment already exists",
          description: "This booking has already been paid for.",
          variant: "destructive",
        });
        onOpenChange(false);
        setProcessingPayment(false);
        return;
      }
      
      const paymentData = {
        booking_id: selectedBooking.id,
        user_id: selectedBooking.user_id,
        amount: selectedBooking.total_price || selectedBooking.cost || 0,
        payment_method: paymentMethod,
        payment_type: 'payment',
        status: 'completed',
        transaction_id: paymentMethod === 'cash' ? 'CASH-' + Date.now() : transactionId,
        notes: `Payment for booking ${selectedBooking.id}`
      };
      
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select();
      
      if (error) throw error;
      
      if (selectedBooking.status === 'active') {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', selectedBooking.id);
        
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Payment processed successfully",
        description: `Payment of ${formatCurrency(paymentData.amount)} has been recorded.`,
      });
      
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error processing payment';
      toast({
        title: "Payment processing failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      onOpenChange(false);
      setProcessingPayment(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Record payment details for the selected booking.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              value={formatCurrency(selectedBooking?.total_price || selectedBooking?.cost || 0)}
              className="col-span-3"
              disabled
            />
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
          {paymentMethod !== 'cash' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transaction" className="text-right">
                Transaction ID
              </Label>
              <Input
                id="transaction"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="col-span-3"
                placeholder="Enter transaction reference"
              />
            </div>
          )}
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
            onClick={handleProcessPayment}
            disabled={processingPayment || (paymentMethod !== 'cash' && !transactionId)}
          >
            {processingPayment ? (
              <>Processing...</>
            ) : (
              <>Process Payment</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
