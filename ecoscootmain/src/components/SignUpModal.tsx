
import { X } from "lucide-react";
import { SignUpForm } from "@/components/auth/SignUpForm";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SignUpModal({ isOpen, onClose, onSuccess }: SignUpModalProps) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    console.log("SignUpModal: registration successful");
    // Call the provided onSuccess callback if available
    if (onSuccess) {
      onSuccess();
    } else {
      // Default behavior if no onSuccess provided
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-lg bg-background p-5 shadow-lg animate-in zoom-in-90">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-foreground/70 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold">Sign Up</h2>
          <p className="text-sm text-muted-foreground">
            Create your account
          </p>
        </div>

        <SignUpForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
