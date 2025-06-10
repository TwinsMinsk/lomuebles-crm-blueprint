
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UpdateTaskData {
  task_id: number;
  description?: string;
  task_status?: string;
  completion_date?: string | null;
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ task_id, ...updateData }: UpdateTaskData) => {
      console.log('Updating task:', { task_id, updateData });

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('task_id', task_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      console.log('Task updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch task data
      queryClient.invalidateQueries({ queryKey: ['task', data.task_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: "Задача обновлена",
        description: "Изменения сохранены успешно",
      });
    },
    onError: (error: any) => {
      console.error('Task update failed:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      });
    }
  });
};
