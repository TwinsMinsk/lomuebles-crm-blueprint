
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type CalendarFiltersType = {
  assignedUserId: string | null;
  taskStatus: string | null;
};

export const useCalendarFilters = (
  initialFilters: CalendarFiltersType,
  onFilterChange: (filters: CalendarFiltersType) => void
) => {
  const { user } = useAuth();
  const [assignedUserId, setAssignedUserId] = useState<string | null>(initialFilters.assignedUserId);
  const [taskStatus, setTaskStatus] = useState<string | null>(initialFilters.taskStatus);

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      assignedUserId,
      taskStatus,
    });
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      assignedUserId: user?.id || null,
      taskStatus: null,
    };
    
    setAssignedUserId(defaultFilters.assignedUserId);
    setTaskStatus(defaultFilters.taskStatus);
    onFilterChange(defaultFilters);
  };

  return {
    filters: { assignedUserId, taskStatus },
    setAssignedUserId,
    setTaskStatus,
    applyFilters,
    resetFilters,
  };
};
