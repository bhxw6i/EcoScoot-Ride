
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from './ProfileTab';
import { PaymentsTab } from './PaymentsTab';
import { Profile, Payment } from './types';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProfile: Profile | null;
  selectedTab: string;
  onTabChange: (value: string) => void;
  isPaymentLoading: boolean;
  userPayments: Payment[];
  getFormattedDate: (dateString: string | null) => string;
  formatAmount: (amount: number) => string;
  getStatusBadgeColor: (status: string) => string;
  onViewPaymentDetails: (payment: Payment) => void;
}

export const UserDetailsDialog = ({
  open,
  onOpenChange,
  selectedProfile,
  selectedTab,
  onTabChange,
  isPaymentLoading,
  userPayments,
  getFormattedDate,
  formatAmount,
  getStatusBadgeColor,
  onViewPaymentDetails
}: UserDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>User Management</DialogTitle>
          <DialogDescription>
            View and manage user details and payments
          </DialogDescription>
        </DialogHeader>
        
        {selectedProfile && (
          <Tabs value={selectedTab} onValueChange={onTabChange} className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="profile" className="space-y-4">
              <ProfileTab profile={selectedProfile} getFormattedDate={getFormattedDate} />
            </TabsContent>
            
            <TabsContent value="payments">
              <PaymentsTab 
                isPaymentLoading={isPaymentLoading}
                userPayments={userPayments}
                getFormattedDate={getFormattedDate}
                formatAmount={formatAmount}
                getStatusBadgeColor={getStatusBadgeColor}
                onViewPaymentDetails={onViewPaymentDetails}
              />
            </TabsContent>
          </Tabs>
        )}
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
