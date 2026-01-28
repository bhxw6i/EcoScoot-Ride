
import * as React from "react";
import { format, isValid } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TimePickerSelectProps {
  value: Date | undefined;
  onChange: (value: Date) => void;
  label?: string;
  className?: string;
  minDate?: Date;
}

export function TimePickerSelect({ value, onChange, label, className, minDate }: TimePickerSelectProps) {
  // Generate time options from 00:00 to 23:00 in hourly increments
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // Split the date and time for separate handling
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [selectedTime, setSelectedTime] = React.useState<string>(
    value && isValid(value) ? format(value, "HH:00") : "09:00"
  );
  
  // State for the time selection dialog
  const [timeDialogOpen, setTimeDialogOpen] = React.useState(false);

  // Combine date and time when either changes
  React.useEffect(() => {
    if (selectedDate) {
      const [hours] = selectedTime.split(':').map(Number);
      
      // Create a new date object to avoid mutating the original
      const newDate = new Date(selectedDate);
      
      // Set the time components properly
      newDate.setHours(hours, 0, 0, 0);
      
      // Ensure the time zone offset doesn't affect the stored time
      console.log(`Setting date with time: ${format(newDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")}`);
      
      onChange(newDate);
    }
  }, [selectedDate, selectedTime, onChange]);

  // Update local state when value changes externally
  React.useEffect(() => {
    if (value && isValid(value)) {
      setSelectedDate(value);
      setSelectedTime(format(value, "HH:00"));
    }
  }, [value]);

  // Handle date selection and open time dialog
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setTimeDialogOpen(true);
    }
  };

  // Handle time selection and close dialog
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTimeDialogOpen(false);
  };

  return (
    <div className={className}>
      {label && <div className="text-sm font-medium mb-2">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {value && isValid(value) ? (
                <span>{format(value, "PPP 'at' HH:00")}</span>
              ) : (
                <span>Select date and time</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="mb-3 text-sm font-medium">Select Date</div>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => (minDate ? date < minDate : date < new Date())}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Time Selection Dialog */}
      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Select Time</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center mb-3">
                <Clock className="mr-2 h-4 w-4 text-foreground/60" />
                <span className="text-sm font-medium">Choose hour</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {timeOptions.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => handleTimeSelect(time)}
                    className="h-10"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
