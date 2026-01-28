import { useState, useEffect, useCallback } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BookingTable from "./bookings/BookingTable";
import BookingFilter from "./bookings/BookingFilter";
import PaymentDialog from "./bookings/PaymentDialog";
import StatusDialog from "./bookings/StatusDialog";
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

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching bookings with statuses: active, reserved, completed");
      
      // Directly check the exact query we're executing
      console.log("Executing query:", "SELECT * FROM bookings WHERE status IN ('active', 'reserved', 'completed')");
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          ),
          scooters:scooter_id (
            model
          )
        `)
        .in('status', ['active', 'reserved', 'completed']);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      // Log the raw data to help with debugging
      console.log("Raw bookings data:", data);
      
      if (!data || data.length === 0) {
        console.log("No bookings found in the database with the specified statuses");
        
        // For testing, let's try a simplified query to see if we get any bookings at all
        const { data: allBookings, error: allError } = await supabase
          .from('bookings')
          .select('id, status');
        
        console.log("All bookings check:", allBookings);
        if (allError) console.error("Error checking all bookings:", allError);
        
        setBookings([]);
        setFilteredBookings([]);
        setIsLoading(false);
        return;
      }
      
      const processedBookings = data.map(booking => ({
        ...booking,
        user_name: booking.profiles ? 
          `${booking.profiles.first_name || ''} ${booking.profiles.last_name || ''}`.trim() : 
          'Unknown User',
        user_email: booking.profiles?.email || 'unknown@email.com',
        scooter_model: booking.scooters?.model || 'Unknown Model'
      }));
      
      console.log("Processed bookings:", processedBookings);
      setBookings(processedBookings);
      
      // Apply initial filtering
      const initialFiltered = statusFilter === "all" 
        ? processedBookings 
        : processedBookings.filter(booking => booking.status === statusFilter);
      
      console.log("Initially filtered bookings:", initialFiltered);
      setFilteredBookings(initialFiltered);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error fetching bookings';
      toast({
        title: "Error fetching bookings",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, statusFilter]);

  // Fetch bookings on component mount and when fetchBookings dependencies change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const filterBookings = useCallback(() => {
    if (!bookings.length) {
      console.log("No bookings to filter");
      setFilteredBookings([]);
      return;
    }
    
    if (!searchTerm.trim() && statusFilter === "all") {
      console.log("No filter applied, showing all bookings");
      setFilteredBookings(bookings);
      return;
    }
    
    let filtered = [...bookings];
    
    // Apply status filter if not "all"
    if (statusFilter !== "all") {
      console.log(`Filtering by status: ${statusFilter}`);
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Apply search term filter if provided
    if (searchTerm.trim()) {
      console.log(`Filtering by search term: ${searchTerm}`);
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        (booking.user_name && booking.user_name.toLowerCase().includes(lowerTerm)) ||
        (booking.user_email && booking.user_email.toLowerCase().includes(lowerTerm)) ||
        (booking.scooter_model && booking.scooter_model.toLowerCase().includes(lowerTerm)) ||
        booking.start_location.toLowerCase().includes(lowerTerm) ||
        booking.id.toLowerCase().includes(lowerTerm)
      );
    }
    
    console.log("Filtered bookings:", filtered);
    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter]);

  const openPaymentDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentDialogOpen(true);
  };

  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setStatusDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground mt-1">Update booking statuses and process payments</p>
      </header>
      
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Active Bookings</CardTitle>
            <BookingFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
        </CardHeader>
        <CardContent>
          <BookingTable
            bookings={filteredBookings}
            isLoading={isLoading}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            onStatusUpdate={openStatusDialog}
            onProcessPayment={openPaymentDialog}
          />
        </CardContent>
      </Card>

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        selectedBooking={selectedBooking}
        onSuccess={fetchBookings}
        formatCurrency={formatCurrency}
      />

      <StatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        selectedBooking={selectedBooking}
        onSuccess={fetchBookings}
      />
    </div>
  );
}
