
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log("Checking admin status...");
        
        // First check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No authenticated user found");
          setIsAdmin(false);
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
          setIsAdmin(false);
          return;
        }
        
        // Role ID 2 is for admin users
        const isUserAdmin = profileData?.role_id === 2;
        console.log("Admin check result:", isUserAdmin, "Role ID:", profileData?.role_id);
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin area.",
            variant: "destructive",
          });
        } else {
          console.log("Admin user confirmed, allowing access to admin dashboard");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);
  
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-2">Verifying admin access...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    console.log("Not an admin, redirecting to home");
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  console.log("Admin access granted, rendering admin content");
  return <>{children}</>;
}
