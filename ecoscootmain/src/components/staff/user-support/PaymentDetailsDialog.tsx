
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from '@/components/icons';
import { Payment } from './types';
import { useState } from 'react';

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPayment: Payment | null;
  paymentStatus: string;
  onPaymentStatusChange: (value: string) => void;
  getFormattedDate: (dateString: string | null) => string;
  formatAmount: (amount: number) => string;
  onUpdatePaymentStatus: () => void;
}

export const PaymentDetailsDialog = ({
  open,
  onOpenChange,
  selectedPayment,
  paymentStatus,
  onPaymentStatusChange,
  getFormattedDate,
  formatAmount,
  onUpdatePaymentStatus
}: PaymentDetailsDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    await onUpdatePaymentStatus();
    setIsUpdating(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Payment</DialogTitle>
          <DialogDescription>
            Update payment status or process refunds
          </DialogDescription>
        </DialogHeader>
        
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Payment ID</Label>
                <p className="text-sm font-mono">{selectedPayment.id}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="text-sm font-medium">{formatAmount(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="text-sm">{getFormattedDate(selectedPayment.created_at)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Method</Label>
                  <p className="text-sm capitalize">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <p className="text-sm capitalize">{selectedPayment.payment_type}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
