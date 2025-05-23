
import { useState, useEffect } from "react";
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
  const [isSuccess, setIsSuccess] = useState(false);
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
        // If initialData exists but doesn't have task_name (from calendar), parse the due_date
        due_date: initialData?.due_date ? new Date(initialData.due_date) : null,
      };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  // Log form state for debugging
  useEffect(() => {
    console.log("useTaskForm initialized", { 
      isEditing: !!initialData?.task_id,
      defaultValues
    });
  }, [initialData]);

  const onSubmit = async (data: TaskFormValues) => {
    console.log("onSubmit called with data:", data);
    
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
        ...(initialData?.task_id ? {} : { creator_user_id: user.id }),
        // Set or clear completion_date based on status
        completion_date: data.task_status === "Выполнена" 
          ? new Date().toISOString()
          : null,
        // Ensure required fields are present
        assigned_task_user_id: data.assigned_task_user_id || user.id,
        task_name: data.task_name
      };

      console.log("Data being sent to Supabase:", taskData);

      // For existing tasks, update
      if (initialData?.task_id) {
        const { data: updatedData, error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('task_id', initialData.task_id)
          .select();

        if (error) {
          console.error("Supabase Task Update Error:", error);
          throw error;
        }
        
        console.log("Task updated successfully:", updatedData);
        toast.success("Задача успешно обновлена");
      } 
      // For new tasks, insert
      else {
        const { data: insertedData, error } = await supabase
          .from('tasks')
          .insert([taskData])
          .select();

        if (error) {
          console.error("Supabase Task Insert Error:", error);
          throw error;
        }
        
        console.log("Task created successfully:", insertedData);
        toast.success("Задача успешно создана");
      }

      // Invalidate task queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["calendarTasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      
      // Set success state
      setIsSuccess(true);

      // Call success callback if provided
      if (onSuccess) {
        console.log("Calling onSuccess callback");
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast.error(`Ошибка при сохранении задачи: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isSubmitting: isLoading, // Add isSubmitting alias for isLoading
    isSuccess,
    onSubmit,
    isEditing: !!initialData?.task_id,
  };
};
