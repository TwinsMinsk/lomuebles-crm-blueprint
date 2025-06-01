
import { Task } from "@/types/task";
import { toMadridTime } from "@/utils/timezone";

export const convertTasksToEvents = (tasks: Task[]) => {
  return tasks.map((task) => {
    // Skip tasks without a due date
    if (!task.due_date) return null;

    // Convert UTC due date to Madrid time for display in calendar
    const madridDueDate = toMadridTime(task.due_date);

    console.log('convertTasksToEvents: Converting task due date', {
      taskId: task.task_id,
      originalDueDate: task.due_date,
      madridDueDate: madridDueDate
    });

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
      start: madridDueDate, // Use Madrid time for calendar display
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
};
