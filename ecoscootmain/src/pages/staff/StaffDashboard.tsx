import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StaffSidebar from '@/components/staff/StaffSidebar';
import StaffOverview from '@/components/staff/StaffOverview';
import StaffVehicles from '@/components/staff/StaffVehicles';
import ChargingManagement from '@/components/staff/ChargingManagement';
import UserSupport from '@/components/staff/UserSupport';
import BookingManagement from '@/components/staff/BookingManagement';
import StaffPayments from '@/components/staff/StaffPayments';
import { ThemeToggle } from '@/components/ThemeToggle';

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role_id: number;
};

export default function StaffDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role_id')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setUserProfile(data as UserProfile);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen bg-background">
      <StaffSidebar userName={userProfile.first_name || "Staff"} />
      <div className="flex-1 overflow-auto relative">
        {/* Theme toggle positioned in the top right corner */}
        <div className="absolute top-4 right-6 z-10">
          <ThemeToggle />
        </div>
        <Routes>
          <Route path="/" element={<StaffOverview />} />
          <Route path="/vehicles" element={<StaffVehicles />} />
          <Route path="/charging" element={<ChargingManagement />} />
          <Route path="/bookings" element={<BookingManagement />} />
          <Route path="/users" element={<UserSupport />} />
          <Route path="/payments" element={<StaffPayments />} />
          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Routes>
      </div>
    </div>
  );
}
