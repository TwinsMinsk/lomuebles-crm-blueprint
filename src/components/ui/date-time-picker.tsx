
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

interface DateTimePickerProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
}

export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | null>(value || null);
  const [hours, setHours] = React.useState<string>(
    value ? format(value, "HH") : "12"
  );
  const [minutes, setMinutes] = React.useState<string>(
    value ? format(value, "mm") : "00"
  );
  
  const [isTimeOpen, setIsTimeOpen] = React.useState<boolean>(false);

  // Generate options for hours (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hourValue = i.toString().padStart(2, "0");
    return { value: hourValue, label: hourValue };
  });

  // Generate options for minutes (00-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const minuteValue = i.toString().padStart(2, "0");
    return { value: minuteValue, label: minuteValue };
  });

  // Update the parent component whenever date or time changes
  React.useEffect(() => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours));
      newDate.setMinutes(parseInt(minutes));
      onChange(newDate);
    } else {
      onChange(null);
    }
  }, [date, hours, minutes, onChange]);

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setDate(value);
      setHours(format(value, "HH"));
      setMinutes(format(value, "mm"));
    } else {
      setDate(null);
    }
  }, [value]);

  // Format the time string for display
  const timeString = `${hours}:${minutes}`;

  // Handler for hour selection that prevents popup from closing
  const handleHourChange = (value: string) => {
    setHours(value);
  };

  // Handler for minute selection that prevents popup from closing
  const handleMinuteChange = (value: string) => {
    setMinutes(value);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full sm:w-auto justify-start text-left font-normal",
              !date && "text-muted-foreground",
              "flex-grow"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd.MM.yyyy") : <span>Выберите дату</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={setDate}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full sm:w-auto justify-start text-left font-normal",
              !date && "text-muted-foreground",
              "min-w-[120px]"
            )}
            disabled={!date || disabled}
          >
            <Clock className="mr-2 h-4 w-4" />
            {date ? timeString : <span>Выберите время</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex space-x-2">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground font-medium">
                Час
              </span>
              <Select 
                value={hours}
                onValueChange={handleHourChange}
                disabled={!date || disabled}
                onOpenChange={(open) => {
                  // Prevent closing the parent popover when opening the select
                  if (open) {
                    // Make sure we retain focus in the popover
                    setTimeout(() => {
                      document.querySelector('[data-state="open"]')?.addEventListener(
                        'click',
                        (e) => e.stopPropagation(),
                        { once: true }
                      );
                    }, 0);
                  }
                }}
              >
                <SelectTrigger 
                  className="w-[70px]"
                  onPointerDown={(e) => {
                    // Prevent the popover from closing when clicking on select trigger
                    e.stopPropagation();
                  }}
                >
                  <SelectValue placeholder="Час" />
                </SelectTrigger>
                <SelectContent 
                  position="popper"
                  onCloseAutoFocus={(e) => {
                    // Prevent auto focus behavior from closing the parent popover
                    e.preventDefault();
                  }}
                >
                  {hourOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground font-medium">
                Мин
              </span>
              <Select 
                value={minutes} 
                onValueChange={handleMinuteChange}
                disabled={!date || disabled}
                onOpenChange={(open) => {
                  // Prevent closing the parent popover when opening the select
                  if (open) {
                    // Make sure we retain focus in the popover
                    setTimeout(() => {
                      document.querySelector('[data-state="open"]')?.addEventListener(
                        'click',
                        (e) => e.stopPropagation(),
                        { once: true }
                      );
                    }, 0);
                  }
                }}
              >
                <SelectTrigger 
                  className="w-[70px]"
                  onPointerDown={(e) => {
                    // Prevent the popover from closing when clicking on select trigger
                    e.stopPropagation();
                  }}
                >
                  <SelectValue placeholder="Мин" />
                </SelectTrigger>
                <SelectContent 
                  position="popper"
                  onCloseAutoFocus={(e) => {
                    // Prevent auto focus behavior from closing the parent popover
                    e.preventDefault();
                  }}
                >
                  {minuteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
