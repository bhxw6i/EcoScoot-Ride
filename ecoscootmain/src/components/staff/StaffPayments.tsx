
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PaymentStatusDialog from "./PaymentStatusDialog";
import { Payment } from "./user-support/types";
import { MoreHorizontal } from "lucide-react";

interface PaymentWithProfile extends Payment {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export default function StaffPayments() {
  const [payments, setPayments] = useState<PaymentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStatusDialog = (payment: PaymentWithProfile) => {
    setSelectedPayment(payment);
    setStatusDialogOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter((payment) => {
    const userName = payment.profiles ? 
      `${payment.profiles.first_name || ''} ${payment.profiles.last_name || ''}`.trim() : 
      '';
    
    const userEmail = payment.profiles?.email || '';
    
    return (
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.payment_method &&
        payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (payment.status &&
        payment.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mt-6 mb-4">Payment Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <span>View and manage payment transactions</span>
              <div className="w-64">
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="rounded-md border overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const userName = payment.profiles ? 
                      `${payment.profiles.first_name || ''} ${payment.profiles.last_name || ''}`.trim() : 
                      'Unknown';
                    
                    const userEmail = payment.profiles?.email || 'No email';
                    
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {userEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${Number(payment.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.payment_method || "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleOpenStatusDialog(payment)}
                              >
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {searchQuery
                ? "No payments found matching your search"
                : "No payment records found"}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        selectedPayment={selectedPayment}
        onSuccess={fetchPayments}
      />
    </div>
  );
}
