import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminPayments from '@/components/admin/AdminPayments';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminVehicles from '@/components/admin/AdminVehicles';
import AdminChargingStations from '@/components/admin/AdminChargingStations';
import AdminSettings from '@/components/admin/AdminSettings';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role_id: number;
};

export default function AdminDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          console.log("No authenticated user found");
          return;
        }
        
        console.log("Fetching user profile for user:", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role_id')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Could not load your profile. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log("User profile fetched:", data);
          
          // Check if user has admin role (role_id = 2)
          if (data.role_id !== 2) {
            console.log("User does not have admin role. Role ID:", data.role_id);
            toast({
              title: "Access Denied",
              description: "You don't have permission to access the admin area.",
              variant: "destructive",
            });
          } else {
            console.log("Admin user detected, proceeding to dashboard");
            setUserProfile(data as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting");
        setUserProfile(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    console.log("No user profile or unauthorized, redirecting to home");
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar userName={userProfile.first_name || "Admin"} />
      <div className="flex-1 overflow-auto relative">
        {/* Theme toggle positioned in the top right corner */}
        <div className="absolute top-4 right-6 z-10">
          <ThemeToggle />
        </div>
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
          <Route path="/payments" element={<AdminPayments />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/vehicles" element={<AdminVehicles />} />
          <Route path="/charging-stations" element={<AdminChargingStations />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}
