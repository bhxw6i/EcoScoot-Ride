import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCard, 
  DollarSign, 
  History, 
  Search, 
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { Payment } from "../staff/user-support/types";

interface PaymentWithExtras extends Payment {
  user_name?: string;
  user_email?: string;
  booking_details?: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  bookings?: {
    id: string;
    scooter_id: string;
    start_location: string;
  } | null;
}

interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  refundAmount: number;
  pendingCount: number;
  refundCount: number;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentWithExtras[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithExtras[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithExtras | null>(null);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingAmount: 0,
    refundAmount: 0,
    pendingCount: 0,
    refundCount: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching payment data from Supabase...");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn("No authenticated session found when fetching payments");
      }
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          ),
          bookings:booking_id (
            id,
            scooter_id,
            start_location
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }
      
      const processedPayments = await Promise.all(data.map(async payment => {
        let bookingDetails = 'No booking attached';
        
        if (payment.booking_id && payment.bookings) {
          const { data: scooterData } = await supabase
            .from('scooters')
            .select('model')
            .eq('id', payment.bookings.scooter_id)
            .single();
            
          const scooterModel = scooterData?.model || 'Unknown model';
          bookingDetails = `${scooterModel} at ${payment.bookings.start_location}`;
        }
        
        return {
          ...payment,
          user_name: payment.profiles ? 
            `${payment.profiles.first_name || ''} ${payment.profiles.last_name || ''}`.trim() : 
            'Unknown User',
          user_email: payment.profiles?.email || 'unknown@email.com',
          booking_details: bookingDetails
        };
      }));
      
      console.log(`Successfully fetched ${processedPayments.length || 0} payments:`, processedPayments);
      
      const stats = processedPayments.reduce((acc, payment) => {
        if (payment.payment_type === 'payment') {
          acc.totalRevenue += Number(payment.amount);
          
          if (payment.status === 'pending') {
            acc.pendingAmount += Number(payment.amount);
            acc.pendingCount++;
          }
        } else if (payment.payment_type === 'refund') {
          acc.refundAmount += Number(payment.amount);
          
          if (payment.status === 'pending') {
            acc.refundCount++;
          }
        }
        return acc;
      }, {
        totalRevenue: 0,
        pendingAmount: 0,
        refundAmount: 0,
        pendingCount: 0,
        refundCount: 0
      });
      
      setStats(stats);
      setPayments(processedPayments);
      setFilteredPayments(processedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error fetching payments",
        description: "Could not load payment data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const handlePopState = () => {
      if (refundDialogOpen) {
        setRefundDialogOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [refundDialogOpen]);

  useEffect(() => {
    if (refundDialogOpen) {
      window.history.pushState({ refundDialog: true }, '', location.pathname);
    }
  }, [refundDialogOpen, location.pathname]);

  const refundFormSchema = z.object({
    amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
    notes: z.string().optional(),
  });

  const refundForm = useForm<z.infer<typeof refundFormSchema>>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      amount: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchPayments();

    const intervalId = setInterval(() => {
      fetchPayments();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchPayments]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter(payment => 
        (payment.user_name && payment.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.user_email && payment.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.transaction_id && payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        payment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.booking_details && payment.booking_details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPayments(filtered);
    }
  }, [searchTerm, payments]);

  const handleDialogClose = () => {
    setRefundDialogOpen(false);
    if (window.history.state && window.history.state.refundDialog) {
      window.history.back();
    }
  };

  const handleRefundClick = (payment: PaymentWithExtras) => {
    setSelectedPayment(payment);
    refundForm.setValue('amount', payment.amount.toString());
    setRefundDialogOpen(true);
  };

  const handleRefundSubmit = async (values: z.infer<typeof refundFormSchema>) => {
    if (!selectedPayment) return;
    
    try {
      console.log("Processing refund:", {
        userId: selectedPayment.user_id,
        bookingId: selectedPayment.booking_id,
        amount: parseFloat(values.amount),
        notes: values.notes
      });
      
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: selectedPayment.user_id,
          booking_id: selectedPayment.booking_id,
          amount: parseFloat(values.amount),
          status: 'pending',
          payment_type: 'refund',
          payment_method: selectedPayment.payment_method,
          transaction_id: `refund_${Date.now()}`,
          notes: values.notes || `Refund for transaction ${selectedPayment.transaction_id}`
        })
        .select();
      
      if (error) {
        console.error("Error processing refund:", error);
        throw error;
      }
      
      console.log("Refund created successfully:", data);
      
      toast({
        title: "Refund initiated",
        description: "The refund has been initiated and is pending approval.",
      });
      
      handleDialogClose();
      fetchPayments();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast({
        title: "Refund failed",
        description: "There was an error processing the refund. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground mt-1">Track revenue and manage payment transactions</p>
      </header>
      
      <div className="grid gap-6 mb-6 sm:grid-cols-3">
        <Card className="border border-border transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total processed payments</p>
          </CardContent>
        </Card>
        
        <Card className="border border-border transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.pendingCount} transactions pending</p>
          </CardContent>
        </Card>
        
        <Card className="border border-border transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Refund Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <History className="h-5 w-5 text-accent mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(stats.refundAmount)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.refundCount} refunds pending approval</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search transactions..." 
                  className="pl-8 w-full sm:w-[200px] md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading payment data...</p>
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Customer</TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span>Amount</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booking Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{payment.user_name}</span>
                          <span className="text-xs text-muted-foreground">{payment.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={payment.payment_type === 'refund' ? 'text-red-600' : 'text-green-600'}>
                          {payment.payment_type === 'refund' ? '-' : ''}{formatCurrency(payment.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{payment.payment_type}</span>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{payment.payment_method}</span>
                        {payment.transaction_id && (
                          <span className="block text-xs text-muted-foreground truncate max-w-[120px]" title={payment.transaction_id}>
                            {payment.transaction_id}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payment.status)}
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{payment.booking_details}</span>
                      </TableCell>
                      <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                navigator.clipboard.writeText(payment.id);
                                toast({
                                  title: "Copied",
                                  description: "Payment ID copied to clipboard",
                                });
                              }}
                            >
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                if (payment.payment_type !== 'refund') {
                                  handleRefundClick(payment);
                                } else {
                                  toast({
                                    title: "Cannot refund",
                                    description: "This transaction is already a refund",
                                  });
                                }
                              }}
                              disabled={payment.payment_type === 'refund'}
                            >
                              Process Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                toast({
                                  title: "Not implemented",
                                  description: "View details functionality is not implemented yet.",
                                });
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <History className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No transaction history to display</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={refundDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Create a refund for the selected transaction. This will be pending until approved.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...refundForm}>
            <form onSubmit={refundForm.handleSubmit(handleRefundSubmit)} className="space-y-4">
              {selectedPayment && (
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Customer</Label>
                      <div className="text-sm font-medium">{selectedPayment.user_name}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Original Amount</Label>
                      <div className="text-sm font-medium">{formatCurrency(selectedPayment.amount)}</div>
                    </div>
                  </div>
                
                  <FormField
                    control={refundForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refund Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" min="0.01" max={selectedPayment.amount} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={refundForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Reason for refund" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">Process Refund</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
