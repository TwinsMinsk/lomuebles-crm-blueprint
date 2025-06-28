
import { useState } from "react";
import { TaskFiltersType } from "@/types/task";
import { DateRange } from "react-day-picker";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { useAuth } from "@/context/AuthContext";

export function useTaskFilters(
  filters: TaskFiltersType,
  setFilters: (filters: TaskFiltersType) => void
) {
  const { userRole } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleFilterChange = (key: keyof TaskFiltersType, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setFilters({
        ...filters,
        dueDateFrom: startOfDay(range.from),
        dueDateTo: endOfDay(range.to),
        dueDateRange: null,
      });
    } else if (range?.from && !range?.to) {
      setFilters({
        ...filters,
        dueDateFrom: startOfDay(range.from),
        dueDateTo: null,
        dueDateRange: null,
      });
    } else {
      setFilters({
        ...filters,
        dueDateFrom: null,
        dueDateTo: null,
        dueDateRange: null,
      });
    }
  };

  const handlePredefinedDateRange = (rangeType: string) => {
    const today = new Date();
    let from: Date, to: Date;

    switch (rangeType) {
      case "today":
        from = to = today;
        break;
      case "tomorrow":
        from = to = addDays(today, 1);
        break;
      case "week":
        from = today;
        to = addDays(today, 7);
        break;
      case "month":
        from = today;
        to = addDays(today, 30);
        break;
      default:
        setFilters({
          ...filters,
          dueDateFrom: null,
          dueDateTo: null,
          dueDateRange: null,
        });
        setDateRange(undefined);
        return;
    }

    const range = { from: startOfDay(from), to: endOfDay(to) };
    setDateRange(range);
    setFilters({
      ...filters,
      dueDateFrom: range.from,
      dueDateTo: range.to,
      dueDateRange: rangeType,
    });
  };

  const handleUserFilterChange = (value: string) => {
    if (value === "my") {
      setFilters({
        ...filters,
        assignedToMe: true,
        createdByMe: false,
        assignedUserId: null,
      });
    } else if (value === "all") {
      setFilters({
        ...filters,
        assignedToMe: false,
        createdByMe: false,
        assignedUserId: null,
      });
    } else {
      // Specific user selected
      setFilters({
        ...filters,
        assignedToMe: false,
        createdByMe: false,
        assignedUserId: value,
      });
    }
  };

  const handleTaskViewChange = (viewType: "my" | "all") => {
    if (viewType === "my") {
      setFilters({
        ...filters,
        viewType: "my",
        assignedToMe: true,
        createdByMe: false,
        assignedUserId: null,
      });
    } else {
      setFilters({
        ...filters,
        viewType: "all",
        assignedToMe: false,
        createdByMe: false,
        assignedUserId: null,
      });
    }
  };

  const applyFilters = () => {
    // Filters are already applied in real-time, this is just for UI feedback
    console.log("Filters applied:", filters);
  };

  const resetFiltersFunc = () => {
    const isAdmin = userRole === "Главный Администратор" || userRole === "Администратор";
    
    setDateRange(undefined);
    setFilters({
      search: null,
      taskStatus: null,
      taskType: null,
      priority: null,
      assignedToMe: isAdmin ? false : true,
      createdByMe: false,
      viewType: isAdmin ? "all" : "my",
      assignedUserId: null,
      dueDateFrom: null,
      dueDateTo: null,
      dueDateRange: null,
    });
  };

  return {
    dateRange,
    handleFilterChange,
    handleDateRangeSelect,
    handlePredefinedDateRange,
    handleUserFilterChange,
    handleTaskViewChange,
    applyFilters,
    resetFiltersFunc,
  };
}
