
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RequireStaffProps {
  children: ReactNode;
}

export default function RequireStaff({ children }: RequireStaffProps) {
  const location = useLocation();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkStaffStatus = async () => {
      try {
        console.log("Checking staff status...");
        
        // First check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No authenticated user found");
          setIsStaff(false);
          return;
        }
        
        // Get user profile to check role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setIsStaff(false);
          return;
        }
        
        // Role ID 3 is for staff users, and 2 is for admin users
        // We'll allow both staff and admins to access the staff dashboard
        const isUserStaff = profileData?.role_id === 3 || profileData?.role_id === 2;
        console.log("Staff check result:", isUserStaff, "Role ID:", profileData?.role_id);
        setIsStaff(isUserStaff);
        
        if (!isUserStaff) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the staff area.",
            variant: "destructive",
          });
        } else {
          console.log("Staff user confirmed, allowing access to staff dashboard");
        }
      } catch (error) {
        console.error("Error checking staff status:", error);
        setIsStaff(false);
      }
    };
    
    checkStaffStatus();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkStaffStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsStaff(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);
  
  if (isStaff === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-2">Verifying staff access...</p>
      </div>
    );
  }
  
  if (!isStaff) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}
