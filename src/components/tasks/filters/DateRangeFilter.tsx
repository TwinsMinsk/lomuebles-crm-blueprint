
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  dateRange: { from: Date | null; to: Date | null };
  rangeType: string | null | undefined;
  onDateRangeSelect: (range: { from: Date | null; to: Date | null }) => void;
  onPredefinedRangeSelect: (rangeType: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateRange,
  rangeType,
  onDateRangeSelect,
  onPredefinedRangeSelect,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Tabs
          defaultValue={rangeType || "all"}
          onValueChange={onPredefinedRangeSelect}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">Все даты</TabsTrigger>
            <TabsTrigger value="overdue">Просроченные</TabsTrigger>
            <TabsTrigger value="today">Сегодня</TabsTrigger>
            <TabsTrigger value="thisWeek">Эта неделя</TabsTrigger>
            <TabsTrigger value="thisMonth">Этот месяц</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="sm:w-[240px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd.MM.yyyy")} -{" "}
                    {format(dateRange.to, "dd.MM.yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd.MM.yyyy")
                )
              ) : (
                <span>Выберите даты</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangeFilter;
