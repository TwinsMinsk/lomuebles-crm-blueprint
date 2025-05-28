
import * as React from "react";
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
import { CalendarIcon, Clock } from "lucide-react";
import { formatInMadridTime, fromMadridTimeToUTC, toMadridTime } from "@/utils/timezone";

interface DateTimePickerProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
}

export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
  // Convert UTC value to Madrid time for display
  const madridDate = value ? toMadridTime(value) : null;
  
  const [date, setDate] = React.useState<Date | null>(madridDate);
  const [hours, setHours] = React.useState<string>(
    madridDate ? formatInMadridTime(madridDate, "HH") : "12"
  );
  const [minutes, setMinutes] = React.useState<string>(
    madridDate ? formatInMadridTime(madridDate, "mm") : "00"
  );
  
  const [isTimeOpen, setIsTimeOpen] = React.useState<boolean>(false);
  const internalUpdate = React.useRef<boolean>(false);

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
    if (internalUpdate.current) {
      return;
    }

    if (date) {
      // Create a new date in Madrid timezone
      const madridDateTime = new Date(date);
      madridDateTime.setHours(parseInt(hours));
      madridDateTime.setMinutes(parseInt(minutes));
      madridDateTime.setSeconds(0);
      madridDateTime.setMilliseconds(0);
      
      // Convert Madrid time to UTC for storage
      const utcDateTime = fromMadridTimeToUTC(madridDateTime);
      
      internalUpdate.current = true;
      onChange(utcDateTime);
      setTimeout(() => {
        internalUpdate.current = false;
      }, 0);
    } else {
      internalUpdate.current = true;
      onChange(null);
      setTimeout(() => {
        internalUpdate.current = false;
      }, 0);
    }
  }, [date, hours, minutes, onChange]);

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (internalUpdate.current) {
      return;
    }

    if (value) {
      const madridTime = toMadridTime(value);
      setDate(madridTime);
      setHours(formatInMadridTime(madridTime, "HH"));
      setMinutes(formatInMadridTime(madridTime, "mm"));
    } else {
      setDate(null);
    }
  }, [value]);

  // Format the time string for display
  const timeString = `${hours}:${minutes}`;

  const handleHourChange = (value: string) => {
    setHours(value);
  };

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
            {date ? formatInMadridTime(date, "dd.MM.yyyy") : <span>Выберите дату</span>}
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
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Час" />
                </SelectTrigger>
                <SelectContent position="popper">
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
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Мин" />
                </SelectTrigger>
                <SelectContent position="popper">
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
