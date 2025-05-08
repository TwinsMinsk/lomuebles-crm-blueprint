
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
  const {
    filters,
    setAssignedUserId,
    setTaskStatus,
    applyFilters,
    resetFilters,
  } = useCalendarFilters(currentFilters, onFilterChange);

  // Apply filters on component mount if they differ from current filters
  useEffect(() => {
    if (currentFilters.assignedUserId !== filters.assignedUserId || 
        currentFilters.taskStatus !== filters.taskStatus) {
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
