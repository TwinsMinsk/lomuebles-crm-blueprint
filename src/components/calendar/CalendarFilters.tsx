
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { taskStatusOptions } from "@/components/tasks/schema/taskFormSchema";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const { user } = useAuth();
  const [assignedUserId, setAssignedUserId] = useState<string | null>(currentFilters.assignedUserId);
  const [taskStatus, setTaskStatus] = useState<string | null>(currentFilters.taskStatus);

  // Fetch users for the assigned user filter
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");

      if (error) {
        throw error;
      }

      return data.map((user) => ({
        id: user.id,
        name: user.full_name || user.id,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      assignedUserId,
      taskStatus,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setAssignedUserId(user?.id || null);
    setTaskStatus(null);
    onFilterChange({
      assignedUserId: user?.id || null,
      taskStatus: null,
    });
  };

  // Apply filters on component mount
  useEffect(() => {
    if (currentFilters.assignedUserId !== assignedUserId || 
        currentFilters.taskStatus !== taskStatus) {
      applyFilters();
    }
  }, []);

  return (
    <div className="bg-white rounded-lg mb-4">
      <div className="flex flex-wrap gap-4 items-end mb-4">
        {/* Assigned User filter */}
        <div className="w-64">
          <label className="block text-sm font-medium mb-1">
            Исполнитель
          </label>
          <Select
            value={assignedUserId || ""}
            onValueChange={(value) => setAssignedUserId(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все исполнители" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все исполнители</SelectItem>
              <SelectItem value={user?.id || ""}>Мои задачи</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task Status filter */}
        <div className="w-64">
          <label className="block text-sm font-medium mb-1">
            Статус задачи
          </label>
          <Select
            value={taskStatus || ""}
            onValueChange={(value) => setTaskStatus(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {taskStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter action buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={applyFilters}
            variant="default"
          >
            Применить
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
          >
            Сбросить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarFilters;
