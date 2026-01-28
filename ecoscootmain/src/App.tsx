
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import RidesPage from "./pages/RidesPage";
import BookingsPage from "./pages/BookingsPage";
import VehiclesPage from "./pages/VehiclesPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import RequireStaff from "./components/RequireStaff";

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("User authenticated:", user.id);
          setIsAuthenticated(true);
          
          // Check user role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role_id')
            .eq('id', user.id)
            .single();
            
          setIsAdmin(profileData?.role_id === 2);
          setIsStaff(profileData?.role_id === 3 || profileData?.role_id === 2); // Staff or Admin can access staff features
        } else {
          console.log("No authenticated user");
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsStaff(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
        
        // Check user role after sign in
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', session.user.id)
          .single();
          
        setIsAdmin(profileData?.role_id === 2);
        setIsStaff(profileData?.role_id === 3 || profileData?.role_id === 2);
        
        // Don't show the toast here since we're handling it in SignInForm
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsStaff(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            } />
            <Route path="/rides" element={
              <RequireAuth>
                <RidesPage />
              </RequireAuth>
            } />
            <Route path="/bookings" element={
              <RequireAuth>
                <BookingsPage />
              </RequireAuth>
            } />
            <Route path="/vehicles" element={
              <RequireAuth>
                <VehiclesPage />
              </RequireAuth>
            } />
            <Route path="/admin/*" element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            } />
            <Route path="/staff/*" element={
              <RequireStaff>
                <StaffDashboard />
              </RequireStaff>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
