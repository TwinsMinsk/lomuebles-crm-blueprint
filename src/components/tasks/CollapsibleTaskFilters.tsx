
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TaskFiltersType } from "@/types/task";
import { useTaskFilters } from "@/hooks/tasks/useTaskFilters";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

// Import individual filter components
import SearchFilter from "./filters/SearchFilter";
import StatusFilter from "./filters/StatusFilter";
import TaskTypeFilter from "./filters/TaskTypeFilter";
import PriorityFilter from "./filters/PriorityFilter";
import UserFilter from "./filters/UserFilter";
import ViewTypeFilter from "./filters/ViewTypeFilter";
import DateRangeFilter from "./filters/DateRangeFilter";
import FilterActions from "./filters/FilterActions";
import { useAuth } from "@/context/AuthContext";

interface CollapsibleTaskFiltersProps {
  filters: TaskFiltersType;
  setFilters: (filters: TaskFiltersType) => void;
  resetFilters: () => void;
}

const CollapsibleTaskFilters: React.FC<CollapsibleTaskFiltersProps> = ({
  filters,
  setFilters,
  resetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Фильтры</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <div className="space-y-3">
              <DateRangeFilter
                dateRange={dateRange}
                rangeType={filters.dueDateRange}
                onDateRangeSelect={handleDateRangeSelect}
                onPredefinedRangeSelect={handlePredefinedDateRange}
              />
            </div>

            {/* Filter action buttons */}
            <FilterActions 
              onApply={applyFilters} 
              onReset={handleResetFilters}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleTaskFilters;
