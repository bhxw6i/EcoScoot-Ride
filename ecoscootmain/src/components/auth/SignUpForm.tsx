
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./PasswordInput";
import { DateOfBirthInput } from "./DateOfBirthInput";
import { GenderSelect } from "./GenderSelect";
import { LicenseValidityField } from "./LicenseValidityField";

interface SignUpFormProps {
  onSuccess: () => void;
}

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dob: z.string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      // Basic pattern validation for YYYY-MM-DD format
      return /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, "Date must be in YYYY-MM-DD format")
    .refine((val) => {
      try {
        const date = new Date(val);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
          return age - 1 >= 18;
        }
        return age >= 18;
      } catch (e) {
        return false;
      }
    }, "You must be at least 18 years old"),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  licenseNumber: z.string().min(5, "License number is required"),
  licenseValidity: z.date({
    required_error: "License validity date is required",
  }).refine(date => date > new Date(), "License must be valid (not expired)"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "male",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      licenseNumber: "",
      dob: "",
    },
    mode: "onChange"
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted", data);
    
    try {
      setIsLoading(true);
      
      // Parse the date of birth string to a Date object
      const dobDate = new Date(data.dob);
      
      // Create user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            date_of_birth: dobDate.toISOString(),
            gender: data.gender,
            phone: data.phone,
            license_number: data.licenseNumber,
            license_validity: data.licenseValidity.toISOString(),
          },
        },
      });

      if (signUpError) throw signUpError;

      console.log("Signup successful:", authData);

      // Also store the password in the profiles table for our development setup
      if (authData?.user) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ passwords: data.password })
          .eq('id', authData.user.id);
          
        if (profileUpdateError) {
          console.error("Error storing password in profile:", profileUpdateError);
        }
      }

      // Explicitly sign out after registration to avoid auth state issues
      // This will force the user to sign in again with their credentials
      await supabase.auth.signOut();
      console.log("User signed out after registration");

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      let errorMessage = "Something went wrong";
      if (error.message) {
        if (error.message.includes("User already registered")) {
          errorMessage = "This email is already registered. Please try logging in instead.";
        } else if (error.message.includes("Email link is invalid")) {
          errorMessage = "The signup link is invalid. Please try again.";
        } else if (error.message.includes("Email rate limit exceeded")) {
          errorMessage = "Too many signup attempts. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} className="h-9 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} className="h-9 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <DateOfBirthInput />
          <GenderSelect />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} className="h-9 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" {...field} className="h-9 text-sm" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    value={field.value}
                    onChange={field.onChange}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    value={field.value}
                    onChange={field.onChange}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">License Number</FormLabel>
                <FormControl>
                  <Input placeholder="DL-123456789" {...field} className="h-9 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <LicenseValidityField />
        </div>

        <Button
          type="submit"
          className="w-full h-9 text-sm mt-2"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
}
