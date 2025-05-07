
import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from '@fullcalendar/core/locales/ru';
import { useQuery } from "@tanstack/react-query";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFormModal } from "@/hooks/tasks/useTaskFormModal";
import TaskFormModal from "@/components/tasks/TaskFormModal";
import CalendarFilters from "./CalendarFilters";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type CalendarFiltersType = {
  assignedUserId: string | null;
  taskStatus: string | null;
};

const TasksCalendar: React.FC = () => {
  const { user } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const { fetchTasks } = useTasks();
  const { isOpen, selectedTask, openModal, closeModal } = useTaskFormModal();
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

  // Convert tasks to calendar events
  const events = tasks.map((task) => {
    // Skip tasks without a due date
    if (!task.due_date) return null;

    // Determine color based on priority
    let backgroundColor = "#3788d8"; // default blue
    if (task.priority === "Срочно") backgroundColor = "#dc2626"; // red
    else if (task.priority === "Высокий") backgroundColor = "#f59e0b"; // amber
    else if (task.priority === "Низкий") backgroundColor = "#10b981"; // green

    // Determine text color based on status
    let textColor = "#ffffff"; // default white
    let borderColor = backgroundColor;

    // Set different styles based on task status
    if (task.task_status === "Выполнена") {
      backgroundColor = "#9ca3af"; // gray
      borderColor = "#9ca3af";
    } else if (task.task_status === "Отменена") {
      backgroundColor = "#e5e7eb"; // light gray
      textColor = "#4b5563";
      borderColor = "#6b7280";
    }

    const assignedUserName = task.assigned_user_name || "Не назначен";
    
    return {
      id: task.task_id.toString(),
      title: task.task_name,
      start: task.due_date,
      allDay: false,
      backgroundColor,
      borderColor,
      textColor,
      extendedProps: {
        description: task.description,
        type: task.task_type,
        status: task.task_status,
        assignee: assignedUserName,
        priority: task.priority,
        task: task // Store the full task object for later use
      }
    };
  }).filter(Boolean); // Filter out null events (tasks without due date)

  // Handle calendar event click (open task modal)
  const handleEventClick = (info: any) => {
    const taskId = parseInt(info.event.id);
    const task = tasks.find(t => t.task_id === taskId);
    if (task) {
      openModal(task);
    }
  };

  // Handle date click (create new task if option enabled)
  const handleDateClick = (info: any) => {
    // Create a new Date object at the clicked date/time
    const newDate = info.date;
    
    // Create a placeholder task with the selected due date
    const newTask: Partial<Task> = {
      due_date: newDate.toISOString(),
      task_status: "Новая",
      priority: "Средний",
      assigned_task_user_id: user?.id || "",
    };
    
    openModal(newTask as any);
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

  // Apply filters
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

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <CalendarFilters onFilterChange={handleFilterChange} currentFilters={filters} />
        
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => handleViewChange("dayGridMonth")}
            className={`px-3 py-1.5 rounded ${
              currentView === "dayGridMonth" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Месяц
          </button>
          <button
            onClick={() => handleViewChange("timeGridWeek")}
            className={`px-3 py-1.5 rounded ${
              currentView === "timeGridWeek" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Неделя
          </button>
          <button
            onClick={() => handleViewChange("timeGridDay")}
            className={`px-3 py-1.5 rounded ${
              currentView === "timeGridDay" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            День
          </button>
        </div>
        
        <div className="calendar-container" style={{ height: "700px" }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            locale={ruLocale}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false
            }}
            eventContent={(eventInfo) => (
              <div className="fc-event-content p-1">
                <div className="text-sm font-medium truncate">{eventInfo.event.title}</div>
                <div className="text-xs truncate">
                  {eventInfo.timeText} - {eventInfo.event.extendedProps.assignee}
                </div>
                {eventInfo.event.extendedProps.type && (
                  <div className="text-xs truncate">{eventInfo.event.extendedProps.type}</div>
                )}
              </div>
            )}
            editable={true}
            droppable={true}
            eventDrop={handleEventDrop}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
          />
        </div>
      </div>
      
      {isOpen && (
        <TaskFormModal
          open={isOpen}
          onClose={closeModal}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default TasksCalendar;
