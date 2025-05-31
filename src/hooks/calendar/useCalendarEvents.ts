
import { Task } from "@/types/task";
import { useAuth } from "@/context/AuthContext";

export const useCalendarEvents = (tasks: Task[], openModal: (task?: Task) => void) => {
  const { user } = useAuth();

  // Handle calendar event click (open task modal)
  const handleEventClick = (info: any) => {
    const taskId = parseInt(info.event.id);
    const task = tasks.find(t => t.task_id === taskId);
    if (task) {
      openModal(task);
    }
  };

  // Handle date click (create new task)
  const handleDateClick = (info: any) => {
    // Create a new Date object at the clicked date/time
    const newDate = info.date;
    
    // Create a placeholder task with the selected due date
    const newTask = {
      due_date: newDate.toISOString(),
      task_status: "Новая",
      priority: "Средний",
      assigned_task_user_id: user?.id || "",
    };
    
    openModal(newTask as any);
  };

  return {
    handleEventClick,
    handleDateClick,
  };
};
