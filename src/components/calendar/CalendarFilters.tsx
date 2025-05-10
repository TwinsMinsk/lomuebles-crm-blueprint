
import React, { useEffect } from "react";
import { useCalendarFilters } from "@/hooks/calendar/useCalendarFilters";
import AssignedUserFilter from "./filters/AssignedUserFilter";
import TaskStatusFilter from "./filters/TaskStatusFilter";
import CalendarFilterActions from "./filters/CalendarFilterActions";

interface CalendarFiltersProps {
  onFilterChange: (filters: {
    assignedUserId: string | null;
    taskStatus: string | null;
  }) => void;
  currentFilters: {
    assignedUserId: string | null;
    taskStatus: string | null;
  };
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  onFilterChange,
  currentFilters
}) => {
  // Ensure we have safe non-empty string values for filters
  const safeCurrentFilters = {
    assignedUserId: currentFilters.assignedUserId || null,
    taskStatus: currentFilters.taskStatus || null
  };

  const {
    filters,
    setAssignedUserId,
    setTaskStatus,
    applyFilters,
    resetFilters,
  } = useCalendarFilters(safeCurrentFilters, onFilterChange);

  // Apply filters on component mount if they differ from current filters
  useEffect(() => {
    if (safeCurrentFilters.assignedUserId !== filters.assignedUserId || 
        safeCurrentFilters.taskStatus !== filters.taskStatus) {
      applyFilters();
    }
  }, []);

  return (
    <div className="bg-white rounded-lg mb-4">
      <div className="flex flex-wrap gap-4 items-end mb-4">
        {/* Assigned User filter */}
        <AssignedUserFilter
          value={filters.assignedUserId}
          onChange={setAssignedUserId}
        />

        {/* Task Status filter */}
        <TaskStatusFilter
          value={filters.taskStatus}
          onChange={setTaskStatus}
        />

        {/* Filter action buttons */}
        <CalendarFilterActions
          onApply={applyFilters}
          onReset={resetFilters}
        />
      </div>
    </div>
  );
};

export default CalendarFilters;
