
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export function PasswordInput({ 
  id, 
  value, 
  onChange, 
  placeholder = "••••••••", 
  className = "h-8 text-sm" 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-2"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
      </Button>
    </div>
  );
}
