
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTaskDelete() {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteTask, isPending } = useMutation({
    mutationFn: async (taskId: number) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("task_id", taskId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Задача успешно удалена");
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error("Ошибка при удалении задачи");
    },
  });

  return { deleteTask, isPending };
}
