
import { CreditCard, FileText } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Payment } from './types';

interface PaymentsTabProps {
  isPaymentLoading: boolean;
  userPayments: Payment[];
  getFormattedDate: (dateString: string | null) => string;
  formatAmount: (amount: number) => string;
  getStatusBadgeColor: (status: string) => string;
  onViewPaymentDetails: (payment: Payment) => void;
}

export const PaymentsTab = ({ 
  isPaymentLoading, 
  userPayments, 
  getFormattedDate, 
  formatAmount, 
  getStatusBadgeColor,
  onViewPaymentDetails
}: PaymentsTabProps) => {
  if (isPaymentLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userPayments.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="py-12 text-center text-sm text-muted-foreground">
          <div className="mb-3">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
          </div>
          <p>No payment history</p>
          <p className="mt-1 text-xs text-muted-foreground">This user has no payment records</p>
        </div>
      </div>
    );
  }

  // Sort payments with most recent at the top
  const sortedPayments = [...userPayments].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate payment statistics
  const totalAmount = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = sortedPayments.filter(p => p.status === 'completed');
  const completedAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = sortedPayments.filter(p => p.status === 'processing');
  const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const refundedPayments = sortedPayments.filter(p => p.status === 'refunded');
  const refundedAmount = refundedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      {/* Payment summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-sm font-medium text-muted-foreground">Total Payments</div>
          <div className="mt-1 text-2xl font-bold">{formatAmount(totalAmount)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{sortedPayments.length} transactions</div>
        </div>
        
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-sm font-medium text-muted-foreground">Completed</div>
          <div className="mt-1 text-2xl font-bold text-green-500">{formatAmount(completedAmount)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{completedPayments.length} transactions</div>
        </div>
        
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-sm font-medium text-muted-foreground">Pending</div>
          <div className="mt-1 text-2xl font-bold text-yellow-500">{formatAmount(pendingAmount)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{pendingPayments.length} transactions</div>
        </div>
        
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-sm font-medium text-muted-foreground">Refunded</div>
          <div className="mt-1 text-2xl font-bold text-red-500">{formatAmount(refundedAmount)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{refundedPayments.length} transactions</div>
        </div>
      </div>

      {/* Payments table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.map((payment) => (
              <TableRow key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                <TableCell>{getFormattedDate(payment.created_at)}</TableCell>
                <TableCell>{formatAmount(payment.amount)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell className="capitalize">{payment.payment_method}</TableCell>
                <TableCell className="capitalize">{payment.payment_type}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewPaymentDetails(payment)}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                    {payment.booking_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-1"
                        title="View booking details"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
