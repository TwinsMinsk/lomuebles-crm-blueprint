
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "@/types/task";
import FullCalendar from "@fullcalendar/react";

type CalendarFiltersType = {
  assignedUserId: string | null;
  taskStatus: string | null;
};

export const useCalendarState = () => {
  const { user } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const { fetchTasks } = useTasks();
  const [filters, setFilters] = useState<CalendarFiltersType>({
    assignedUserId: user?.id || null,
    taskStatus: null,
  });
  const [currentView, setCurrentView] = useState<string>("dayGridMonth");

  // Fetch all tasks for calendar
  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["calendarTasks", filters],
    queryFn: () =>
      fetchTasks({
        page: 1,
        pageSize: 1000, // Get all tasks for calendar view
        filters: {
          assignedUserId: filters.assignedUserId,
          taskStatus: filters.taskStatus,
        },
      }),
    enabled: !!user,
  });

  // Handle filters
  const handleFilterChange = (newFilters: CalendarFiltersType) => {
    setFilters(newFilters);
  };

  // Change calendar view
  const handleViewChange = (viewType: string) => {
    setCurrentView(viewType);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(viewType);
    }
  };

  // Handle event drag (update task due date)
  const handleEventDrop = async (info: any) => {
    const taskId = parseInt(info.event.id);
    const newDate = info.event.start;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: newDate.toISOString() })
        .eq('task_id', taskId);
        
      if (error) throw error;
      
      toast.success("Дата задачи успешно изменена");
      refetch();
    } catch (error) {
      console.error("Error updating task date:", error);
      toast.error("Ошибка при обновлении даты задачи");
      info.revert();
    }
  };

  return {
    calendarRef,
    tasks,
    filters,
    currentView,
    handleFilterChange,
    handleViewChange,
    handleEventDrop,
    refetch
  };
};
