
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

export function DateOfBirthInput() {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name="dob"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">Date of Birth (YYYY-MM-DD)</FormLabel>
          <FormControl>
            <Input 
              placeholder="2000-01-31" 
              {...field} 
              className="h-9 text-sm" 
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
