import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserTable } from './user-support/UserTable';
import { UserDetailsDialog } from './user-support/UserDetailsDialog';
import { PaymentDetailsDialog } from './user-support/PaymentDetailsDialog';
import { Profile, Payment } from './user-support/types';

export default function UserSupport() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('profile');
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter(
        profile => 
          (profile.first_name && profile.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (profile.last_name && profile.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (profile.email && profile.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (profile.phone && profile.phone.includes(searchTerm))
      );
      setFilteredProfiles(filtered);
    }
  }, [searchTerm, profiles]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching customer profiles...");
      
      // Query all users regardless of role to debug the issue
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error("Error fetching customer profiles:", error);
        throw error;
      }
      
      console.log("All profiles fetched:", data?.length || 0, "profiles");
      if (data && data.length > 0) {
        console.log("Sample profile data:", data[0]);
        console.log("Roles distribution:", data.map(profile => profile.role_id));
      } else {
        console.log("No profiles found at all");
      }
      
      // Filter customers (role_id = 1) after fetching
      const customerProfiles = data?.filter(profile => profile.role_id === 1) || [];
      console.log("Customer profiles after filtering:", customerProfiles.length);
      
      setProfiles(customerProfiles);
      setFilteredProfiles(customerProfiles);
    } catch (error) {
      console.error("Error fetching customer profiles:", error);
      toast({
        title: "Failed to load users",
        description: "There was an error loading customer data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPayments = async (userId: string) => {
    try {
      setIsPaymentLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} payments for user ${userId}`);
      setUserPayments(data || []);
    } catch (error) {
      console.error("Error fetching user payments:", error);
      toast({
        title: "Failed to load payments",
        description: "There was an error loading payment data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleViewUserDetails = (profile: Profile) => {
    setSelectedProfile(profile);
    setSelectedTab('profile');
    fetchUserPayments(profile.id);
    setIsDetailViewOpen(true);
  };

  const handleViewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentStatus(payment.status);
    setIsPaymentDialogOpen(true);
  };

  const updatePaymentStatus = async () => {
    if (!selectedPayment) return;

    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: paymentStatus })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      // Update the payment record in our local state
      setUserPayments(prevPayments =>
        prevPayments.map(payment =>
          payment.id === selectedPayment.id
            ? { ...payment, status: paymentStatus }
            : payment
        )
      );

      // If this is a refund and the status is now set to "refunded", 
      // create a new refund payment record
      if (paymentStatus === 'refunded' && selectedPayment.payment_type !== 'refund') {
        const refundData = {
          user_id: selectedPayment.user_id,
          booking_id: selectedPayment.booking_id,
          amount: selectedPayment.amount,
          payment_method: selectedPayment.payment_method,
          payment_type: 'refund',
          status: 'completed',
          notes: `Refund for payment ${selectedPayment.id}`
        };

        const { error: refundError } = await supabase
          .from('payments')
          .insert(refundData);

        if (refundError) {
          console.error("Error creating refund record:", refundError);
          toast({
            title: "Refund record creation failed",
            description: "Status was updated but couldn't create refund record.",
            variant: "destructive",
          });
        } else {
          // Refresh payments to include the new refund record
          if (selectedProfile) {
            fetchUserPayments(selectedProfile.id);
          }
        }
      }

      toast({
        title: "Payment status updated",
        description: `Payment status has been changed to ${paymentStatus}.`,
      });

      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the payment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage customer information for support purposes</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable 
            isLoading={isLoading} 
            filteredProfiles={filteredProfiles} 
            onViewUserDetails={handleViewUserDetails}
            getFormattedDate={getFormattedDate}
          />
        </CardContent>
      </Card>

      <UserDetailsDialog 
        open={isDetailViewOpen}
        onOpenChange={setIsDetailViewOpen}
        selectedProfile={selectedProfile}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        isPaymentLoading={isPaymentLoading}
        userPayments={userPayments}
        getFormattedDate={getFormattedDate}
        formatAmount={formatAmount}
        getStatusBadgeColor={getStatusBadgeColor}
        onViewPaymentDetails={handleViewPaymentDetails}
      />

      <PaymentDetailsDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        selectedPayment={selectedPayment}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={setPaymentStatus}
        getFormattedDate={getFormattedDate}
        formatAmount={formatAmount}
        onUpdatePaymentStatus={updatePaymentStatus}
      />
    </div>
  );
}
