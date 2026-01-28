import { ReactNode } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Calendar, User } from "lucide-react";
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

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  formatDate: (dateString: string | null) => string;
  formatCurrency: (amount: number | null) => string;
  onStatusUpdate: (booking: Booking) => void;
  onProcessPayment: (booking: Booking) => void;
}

export default function BookingTable({
  bookings,
  isLoading,
  formatDate,
  formatCurrency,
  onStatusUpdate,
  onProcessPayment
}: BookingTableProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'reserved':
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="py-10 text-center">
        <User className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">No bookings found</p>
      </div>
    );
  }

  console.log("Rendering bookings table with:", bookings);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Customer</TableHead>
            <TableHead>Scooter</TableHead>
            <TableHead>Booking Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{booking.user_name}</span>
                  <span className="text-xs text-muted-foreground">{booking.user_email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{booking.scooter_model}</span>
                  <span className="text-xs text-muted-foreground">From: {booking.start_location}</span>
                </div>
              </TableCell>
              <TableCell>{formatDate(booking.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(booking.status)}
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatCurrency(booking.total_price || booking.cost)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onStatusUpdate(booking)}
                >
                  Update Status
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onProcessPayment(booking)}
                >
                  Process Payment
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
