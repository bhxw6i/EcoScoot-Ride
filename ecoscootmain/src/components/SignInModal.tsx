
import { X } from "lucide-react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpModal } from "@/components/SignUpModal";
import { useState, useEffect } from "react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [showSignUp, setShowSignUp] = useState(false);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowSignUp(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Function to handle successful sign-up
  const handleSignUpSuccess = () => {
    console.log("Sign up successful, closing signup modal");
    setShowSignUp(false);
    // We don't close the main modal here to allow the user to log in with their new credentials
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
        <div className="relative w-full max-w-sm rounded-lg bg-background p-3 shadow-lg animate-in zoom-in-90">
          <button
            onClick={onClose}
            className="absolute right-2 top-2 text-foreground/70 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="mb-2 text-center">
            <h2 className="text-lg font-bold">Sign In</h2>
            <p className="text-xs text-muted-foreground">
              Welcome back to EcoScoot
            </p>
          </div>
          
          <SignInForm 
            onSuccess={onClose}
            onSignUpClick={() => setShowSignUp(true)}
          />
        </div>
      </div>

      <SignUpModal 
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSuccess={handleSignUpSuccess}
      />
    </>
  );
}
