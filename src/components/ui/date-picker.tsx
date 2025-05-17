
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { ru } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Выберите дату",
  className,
  disabled = false
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd MMMM yyyy", { locale: ru }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  dateFrom: Date | undefined
  dateTo: Date | undefined
  onDateFromChange: (date: Date | undefined) => void
  onDateToChange: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  className,
  disabled = false
}: DateRangePickerProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DatePicker 
        date={dateFrom} 
        onDateChange={onDateFromChange} 
        placeholder="С" 
        disabled={disabled}
      />
      <span className="text-muted-foreground">—</span>
      <DatePicker 
        date={dateTo} 
        onDateChange={onDateToChange} 
        placeholder="По" 
        disabled={disabled}
      />
    </div>
  )
}
