
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema, TaskFormValues } from "@/components/tasks/schema/taskFormSchema";
import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useTaskForm = (
  initialData?: Task,
  onSuccess?: () => void
) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Parse initial data for the form
  const defaultValues: Partial<TaskFormValues> = initialData
    ? {
        task_name: initialData.task_name,
        description: initialData.description ?? "",
        task_type: initialData.task_type ?? undefined,
        task_status: initialData.task_status,
        priority: initialData.priority ?? "Средний",
        due_date: initialData.due_date ? new Date(initialData.due_date) : null,
        assigned_task_user_id: initialData.assigned_task_user_id,
        related_lead_id: initialData.related_lead_id ?? null,
        related_contact_id: initialData.related_contact_id ?? null,
        related_deal_order_id: initialData.related_deal_order_id ?? null,
        related_partner_manufacturer_id: initialData.related_partner_manufacturer_id ?? null,
        related_custom_request_id: initialData.related_custom_request_id ?? null,
      }
    : {
        task_name: "",
        description: "",
        task_status: "Новая",
        priority: "Средний",
        assigned_task_user_id: user?.id || "",
      };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: TaskFormValues) => {
    if (!user) {
      toast.error("Необходимо авторизоваться");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare task data and ensure types are correct
      const taskData = {
        ...data,
        // Convert Date to ISO string for Supabase
        due_date: data.due_date ? data.due_date.toISOString() : null,
        // Add creator ID for new tasks
        ...(initialData ? {} : { creator_user_id: user.id }),
        // Set or clear completion_date based on status
        completion_date: data.task_status === "Выполнена" 
          ? new Date().toISOString()
          : null,
        // Ensure required fields are present
        assigned_task_user_id: data.assigned_task_user_id || user.id,
        task_name: data.task_name
      };

      // For existing tasks, update
      if (initialData) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('task_id', initialData.task_id);

        if (error) throw error;
        toast.success("Задача успешно обновлена");
      } 
      // For new tasks, insert
      else {
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);

        if (error) throw error;
        toast.success("Задача успешно создана");
      }

      // Invalidate task queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Ошибка при сохранении задачи");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit,
    isEditing: !!initialData,
  };
};
