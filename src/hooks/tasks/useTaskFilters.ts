
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { TaskFiltersType } from "@/types/task";

export function useTaskFilters(
  initialFilters: TaskFiltersType,
  setFilters: (filters: TaskFiltersType) => void
) {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  // Handler for filter changes
  const handleFilterChange = useCallback((key: keyof TaskFiltersType, value: any) => {
    setFilters({ ...initialFilters, [key]: value });
  }, [initialFilters, setFilters]);

  // Handler for date range filter
  const handleDateRangeSelect = useCallback((range: { from: Date | null; to: Date | null }) => {
    setDateRange(range);
    if (range.from) {
      const updatedFilters = { ...initialFilters };
      updatedFilters.dueDateFrom = range.from;
      updatedFilters.dueDateTo = range.to || range.from;
      setFilters(updatedFilters);
    }
  }, [initialFilters, setFilters]);

  // Handler for predefined date ranges
  const handlePredefinedDateRange = useCallback((rangeType: string) => {
    const now = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (rangeType) {
      case 'overdue':
        toDate = new Date(now.setHours(0, 0, 0, 0));
        toDate.setDate(toDate.getDate() - 1);
        break;
      case 'today':
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        toDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'thisWeek':
        fromDate = new Date(now);
        const dayOfWeek = fromDate.getDay();
        const diff = fromDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
        fromDate = new Date(fromDate.setDate(diff));
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + 6);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'all':
        fromDate = null;
        toDate = null;
        break;
    }

    setDateRange({ from: fromDate, to: toDate });
    handleFilterChange('dueDateFrom', fromDate);
    handleFilterChange('dueDateTo', toDate);
    handleFilterChange('dueDateRange', rangeType);
  }, [handleFilterChange]);

  // Handler for assigned user filter
  const handleUserFilterChange = useCallback((value: string) => {
    if (value === "all") {
      handleFilterChange("assignedUserId", null);
    } else if (value === "my") {
      handleFilterChange("assignedUserId", user?.id || null);
    } else {
      handleFilterChange("assignedUserId", value);
    }
  }, [handleFilterChange, user]);

  // Handler for task view change
  const handleTaskViewChange = useCallback((view: string) => {
    if (view === "my") {
      setFilters({
        ...initialFilters,
        assignedToMe: true,
        createdByMe: true,
        viewType: "my",
      });
    } else if (view === "all") {
      setFilters({
        ...initialFilters,
        assignedToMe: false,
        createdByMe: false,
        viewType: "all",
      });
    }
  }, [initialFilters, setFilters]);

  const applyFilters = useCallback(() => {
    // This function would trigger the refetch if needed
    // Currently, filters are applied reactively
  }, []);

  const resetFiltersFunc = useCallback(() => {
    setDateRange({ from: null, to: null });
  }, []);

  return {
    dateRange,
    handleFilterChange,
    handleDateRangeSelect,
    handlePredefinedDateRange,
    handleUserFilterChange,
    handleTaskViewChange,
    applyFilters,
    resetFiltersFunc
  };
}
