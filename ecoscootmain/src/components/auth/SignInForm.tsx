import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordInput } from "./PasswordInput";
import { AuthSocialButtons } from "./AuthSocialButtons";
import { useNavigate } from "react-router-dom";

interface SignInFormProps {
  onSuccess: () => void;
  onSignUpClick: () => void;
}

interface AuthError {
  message: string;
}

export function SignInForm({ onSuccess, onSignUpClick }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to sign in with:", email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.log("Regular auth failed, trying profile password check:", authError.message);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role_id, passwords')
          .eq('email', email)
          .single();
          
        if (profileError) {
          console.error("Profile lookup error:", profileError);
          throw new Error("Authentication failed. User not found.");
        }
        
        if (profileData.passwords !== password) {
          throw new Error("Authentication failed. Incorrect password.");
        }
        
        console.log("Profile password matched, creating session manually");
        
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email,
          password: "defaultPassword123",
        });
        
        if (sessionError) {
          console.error("Session creation error:", sessionError);
          throw new Error("Could not create session after password verification");
        }
        
        console.log("Manual sign-in successful:", sessionData);
      } else {
        console.log("Regular Supabase auth successful:", authData);
      }
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role_id, first_name, last_name')
          .eq('id', userData.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user role:', profileError);
        } else {
          console.log("User profile data:", profileData);
          
          onSuccess();
          
          if (profileData?.role_id === 2) {
            console.log("Admin user detected, redirecting to admin dashboard");
            navigate('/admin');
          } else if (profileData?.role_id === 3) {
            console.log("Staff user detected, redirecting to staff dashboard");
            navigate('/staff');
          }
        }

        let welcomeMessage = "Welcome";
        if (profileData?.first_name && profileData?.last_name) {
          welcomeMessage += `, ${profileData.first_name} ${profileData.last_name}!`;
        } else if (profileData?.first_name) {
          welcomeMessage += `, ${profileData.first_name}!`;
        } else {
          welcomeMessage += "!";
        }

        toast({
          title: "Signed in successfully",
          description: welcomeMessage,
        });
      }
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      const authError = error as AuthError;
      toast({
        title: "Sign in failed",
        description: authError.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-2">
      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-medium">
            Password
          </label>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
          >
            Forgot?
          </button>
        </div>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      {errorMessage && (
        <div className="text-destructive text-xs mt-1">
          {errorMessage}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full rounded-full h-8 text-sm mt-1"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
      
      <div className="text-center text-xs">
        <span className="text-muted-foreground">
          Don't have an account?{" "}
        </span>
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={onSignUpClick}
        >
          Sign Up
        </button>
      </div>
      
      <AuthSocialButtons />
    </form>
  );
}
