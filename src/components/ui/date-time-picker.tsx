
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
}

export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | null>(value || null);
  const [timeString, setTimeString] = React.useState<string>(
    value ? format(value, "HH:mm") : "12:00"
  );

  // Update the parent component whenever date or time changes
  React.useEffect(() => {
    if (date) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours || 0);
      newDate.setMinutes(minutes || 0);
      onChange(newDate);
    } else {
      onChange(null);
    }
  }, [date, timeString, onChange]);

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTimeString(format(value, "HH:mm"));
    } else {
      setDate(null);
    }
  }, [value]);

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
      
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          value={timeString}
          onChange={(e) => setTimeString(e.target.value)}
          className="w-28"
          disabled={!date || disabled}
          placeholder="ЧЧ:ММ"
          aria-label="Выберите время"
        />
      </div>
    </div>
  );
}
