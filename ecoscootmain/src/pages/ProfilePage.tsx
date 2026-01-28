import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Save, ArrowLeft, Mail, User, Phone, IdCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  phone: string | null;
  license_number: string | null;
  license_validity: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseValidity, setLicenseValidity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        setUser(user);
        await fetchProfile(user.id);
      } catch (error: any) {
        console.error("Error fetching user data:", error.message);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, toast]);

  const fetchProfile = async (userId: string) => {
    try {
      // First check if profile exists
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createProfile(userId);
          return;
        }
        throw error;
      }
      
      setProfile(data);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setGender(data.gender || "");
      setPhone(data.phone || "");
      setLicenseNumber(data.license_number || "");
      setLicenseValidity(data.license_validity ? data.license_validity.substring(0, 10) : "");
      setDateOfBirth(data.date_of_birth ? data.date_of_birth.substring(0, 10) : "");
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            first_name: "",
            last_name: "",
            gender: "",
            phone: "",
            license_number: "",
            license_validity: null,
            date_of_birth: null,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFirstName("");
      setLastName("");
      setGender("");
      setPhone("");
      setLicenseNumber("");
      setLicenseValidity("");
      setDateOfBirth("");
      
      toast({
        title: "Profile created",
        description: "Your profile has been created. Please add your details.",
      });
    } catch (error: any) {
      console.error("Error creating profile:", error.message);
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          gender: gender,
          phone: phone,
          license_number: licenseNumber,
          license_validity: licenseValidity || null,
          date_of_birth: dateOfBirth || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      setSaveSuccess(true);
      
      // Refresh profile data
      await fetchProfile(user.id);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    return "UU";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-24 flex items-center justify-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-24">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Profile Details</h1>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
          
          {saveSuccess && (
            <Alert className="mb-6 bg-primary/10 text-primary border-primary/20">
              <AlertDescription>
                Your profile has been updated successfully!
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-center font-medium">
                  {firstName || lastName 
                    ? `${firstName} ${lastName}`.trim() 
                    : user?.email?.split('@')[0] || "User"}
                </p>
              </div>
              
              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium leading-none mb-2 flex items-center gap-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        First Name <span className="text-destructive">*</span>
                      </h3>
                      <Input 
                        placeholder="First Name" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium leading-none mb-2 flex items-center gap-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Last Name <span className="text-destructive">*</span>
                      </h3>
                      <Input 
                        placeholder="Last Name" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium leading-none mb-2 flex items-center gap-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Gender <span className="text-destructive">*</span>
                    </h3>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium leading-none mb-2 flex items-center gap-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email (optional)
                    </h3>
                    <Input 
                      value={user?.email || ""} 
                      disabled 
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Your email cannot be changed</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium leading-none mb-2 flex items-center gap-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Mobile Number <span className="text-destructive">*</span>
                    </h3>
                    <Input 
                      placeholder="Mobile Number" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium leading-none mb-2 flex items-center gap-1">
                        <IdCard className="w-4 h-4 text-muted-foreground" />
                        License Number <span className="text-destructive">*</span>
                      </h3>
                      <Input 
                        placeholder="License Number" 
                        value={licenseNumber} 
                        onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium leading-none mb-2 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Valid Until <span className="text-destructive">*</span>
                      </h3>
                      <Input 
                        type="date" 
                        value={licenseValidity} 
                        onChange={(e) => setLicenseValidity(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium leading-none mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Date of Birth <span className="text-destructive">*</span>
                    </h3>
                    <Input 
                      type="date" 
                      value={dateOfBirth} 
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium mb-2">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Account Created</p>
                      <p>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p>{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Never"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
