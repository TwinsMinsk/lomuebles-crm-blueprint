
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { TaskFiltersType } from "@/types/task";
import { useTaskFilters } from "@/hooks/tasks/useTaskFilters";

// Import individual filter components
import SearchFilter from "./filters/SearchFilter";
import StatusFilter from "./filters/StatusFilter";
import TaskTypeFilter from "./filters/TaskTypeFilter";
import PriorityFilter from "./filters/PriorityFilter";
import UserFilter from "./filters/UserFilter";
import ViewTypeFilter from "./filters/ViewTypeFilter";
import DateRangeFilter from "./filters/DateRangeFilter";
import FilterActions from "./filters/FilterActions";

interface TaskFiltersProps {
  filters: TaskFiltersType;
  setFilters: (filters: TaskFiltersType) => void;
  resetFilters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  setFilters,
  resetFilters,
}) => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "Главный Администратор" || userRole === "Администратор";
  
  const {
    dateRange,
    handleFilterChange,
    handleDateRangeSelect,
    handlePredefinedDateRange,
    handleUserFilterChange,
    handleTaskViewChange,
    applyFilters,
    resetFiltersFunc
  } = useTaskFilters(filters, setFilters);

  const handleResetFilters = () => {
    resetFilters();
    resetFiltersFunc();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Search filter */}
        <div className="w-full sm:w-auto flex-1">
          <SearchFilter 
            value={filters.search} 
            onChange={(value) => handleFilterChange("search", value)} 
          />
        </div>

        {/* View filter (My tasks vs All tasks) */}
        {isAdmin && (
          <div className="w-full sm:w-[180px]">
            <ViewTypeFilter 
              value={filters.viewType} 
              onChange={handleTaskViewChange}
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Status filter */}
        <div>
          <StatusFilter
            value={filters.taskStatus}
            onChange={(value) => handleFilterChange("taskStatus", value)}
          />
        </div>

        {/* Assigned user filter */}
        <div>
          <UserFilter
            value={filters.assignedUserId || (filters.assignedToMe ? "my" : "all")}
            onUserFilterChange={handleUserFilterChange}
          />
        </div>

        {/* Task type filter */}
        <div>
          <TaskTypeFilter
            value={filters.taskType}
            onChange={(value) => handleFilterChange("taskType", value)}
          />
        </div>

        {/* Priority filter */}
        <div>
          <PriorityFilter
            value={filters.priority}
            onChange={(value) => handleFilterChange("priority", value)}
          />
        </div>
      </div>

      {/* Due date filter */}
      <DateRangeFilter
        dateRange={dateRange}
        rangeType={filters.dueDateRange}
        onDateRangeSelect={handleDateRangeSelect}
        onPredefinedRangeSelect={handlePredefinedDateRange}
      />

      {/* Filter action buttons */}
      <FilterActions 
        onApply={applyFilters} 
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default TaskFilters;
