
import { useEffect, useState } from 'react';
import { Activity, Calendar, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface Booking {
  id: string;
  user_id: string;
  scooter_id: string;
  start_time: string;
  start_location: string;
  status: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
  scooter?: {
    model: string;
    battery_level: number;
  };
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            user_id,
            scooter_id,
            start_time,
            start_location,
            status,
            profiles:user_id(first_name, last_name),
            scooter:scooter_id(model, battery_level)
          `)
          .order('start_time', { ascending: false })
          .limit(15);
        
        if (error) throw error;
        
        // Transform the data to match our Booking interface
        const formattedBookings = data.map((booking: any) => ({
          id: booking.id,
          user_id: booking.user_id,
          scooter_id: booking.scooter_id,
          start_time: booking.start_time,
          start_location: booking.start_location,
          status: booking.status,
          profile: booking.profiles,
          scooter: booking.scooter,
        }));
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching recent bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentBookings();
  }, []);

  const formatName = (profile: any) => {
    if (!profile) return 'Unknown User';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User';
  };

  // Calculate pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-md border">
            <div className="py-6 text-center text-sm text-muted-foreground">
              <div className="mb-2">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
              </div>
              No recent bookings to display
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Scooter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{formatName(booking.profile)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.scooter?.model || 'Unknown Model'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(booking.start_time), 'MMM d, yy HH:mm')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{booking.start_location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${booking.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
