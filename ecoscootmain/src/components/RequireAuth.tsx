
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status in RequireAuth...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error.message);
          setIsAuthenticated(false);
          toast({
            title: "Authentication Error",
            description: "Failed to verify your session. Please sign in again.",
            variant: "destructive",
          });
          return;
        }
        
        if (data && data.session) {
          console.log("User is authenticated in RequireAuth");
          setIsAuthenticated(true);
        } else {
          console.log("No active session found in RequireAuth");
          setIsAuthenticated(false);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error checking authentication:", errorMessage);
        setIsAuthenticated(false);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in RequireAuth:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("User signed in or token refreshed");
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setIsAuthenticated(false);
      }
    });
    
    return () => {
      console.log("Cleaning up auth listener in RequireAuth");
      authListener.subscription.unsubscribe();
    };
  }, [toast, location.pathname]);
  
  if (isAuthenticated === null) {
    // Return a loading indicator when checking authentication
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-lg">Verifying authentication...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we confirm your access.</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log("Not authenticated in RequireAuth, redirecting to home");
    // Redirect to the home page but preserve the intended location
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  console.log("Authentication confirmed in RequireAuth, rendering protected content");
  return <>{children}</>;
}
