
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  User,
  Map as RouteIcon,
  Calendar as CalendarIcon,
  Bike,
  LayoutDashboard,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserMenuProps {
  userEmail: string;
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [initials, setInitials] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching user profile...");
        
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("first_name, last_name, role_id")
            .eq("id", userData.user.id)
            .single();
          
          if (!error && profileData) {
            setIsAdmin(profileData.role_id === 2);
            setIsStaff(profileData.role_id === 3 || profileData.role_id === 2);
            
            if (profileData.first_name && profileData.last_name) {
              setFirstName(profileData.first_name);
              setLastName(profileData.last_name);
              setInitials(`${profileData.first_name.charAt(0)}${profileData.last_name.charAt(0)}`.toUpperCase());
            } else if (profileData.first_name) {
              setFirstName(profileData.first_name);
              setInitials(profileData.first_name.substring(0, 2).toUpperCase());
            } else {
              setInitialsFromEmail();
            }
          } else {
            setInitialsFromEmail();
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setInitialsFromEmail();
      }
    };

    const setInitialsFromEmail = () => {
      if (userEmail) {
        const emailPrefix = userEmail.split('@')[0];
        if (emailPrefix.length > 0) {
          setInitials(emailPrefix.substring(0, 2).toUpperCase());
        }
      }
    };

    fetchUserProfile();
  }, [userEmail]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      
      navigate('/');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred during sign out';
      
      toast({
        title: "Sign out failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { title: "Ride Details", icon: RouteIcon, path: "/rides" },
    { title: "Booking Details", icon: CalendarIcon, path: "/bookings" },
    { title: "Vehicle Details", icon: Bike, path: "/vehicles" },
    { title: "Profile Details", icon: User, path: "/profile" },
  ];

  const handleMenuItemClick = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20">
          <Avatar className="h-9 w-9 border-2 border-primary">
            <AvatarFallback className="bg-primary/5 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {firstName && lastName ? `${firstName} ${lastName}` : firstName ? firstName : userEmail}
            </p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isAdmin && (
          <DropdownMenuItem 
            onClick={() => handleMenuItemClick('/admin')}
            className="cursor-pointer"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        
        {isStaff && (
          <DropdownMenuItem 
            onClick={() => handleMenuItemClick('/staff')}
            className="cursor-pointer"
          >
            <Wrench className="mr-2 h-4 w-4" />
            <span>Staff Dashboard</span>
          </DropdownMenuItem>
        )}
        
        {menuItems.map((item) => (
          <DropdownMenuItem 
            key={item.path}
            onClick={() => handleMenuItemClick(item.path)}
            className="cursor-pointer"
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
