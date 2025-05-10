
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
  const [assignedUserId, setAssignedUserId] = useState<string | null>(
    initialFilters.assignedUserId || (user?.id ? user.id : null)
  );
  const [taskStatus, setTaskStatus] = useState<string | null>(
    initialFilters.taskStatus || null
  );

  // Apply filters - ensure no empty string values
  const applyFilters = () => {
    onFilterChange({
      assignedUserId: assignedUserId === "" ? null : assignedUserId,
      taskStatus: taskStatus === "" ? null : taskStatus,
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
    filters: { 
      assignedUserId: assignedUserId === "" ? null : assignedUserId, 
      taskStatus: taskStatus === "" ? null : taskStatus 
    },
    setAssignedUserId: (value: string | null) => setAssignedUserId(value === "" ? null : value),
    setTaskStatus: (value: string | null) => setTaskStatus(value === "" ? null : value),
    applyFilters,
    resetFilters,
  };
};
