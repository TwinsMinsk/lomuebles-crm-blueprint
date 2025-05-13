
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useLeadDelete = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteLead, isPending: isDeleting } = useMutation({
    mutationFn: async (leadId: number) => {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("lead_id", leadId);

      if (error) {
        console.error('Supabase Lead Delete Error:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: "Успех",
        description: "Лид успешно удален",
      });
    },
    onError: (err: Error) => {
      console.error('Supabase Lead Delete Error:', err);
      toast({
        title: "Ошибка при удалении",
        description: `Ошибка при удалении лида: ${err.message || 'Неизвестная ошибка'}`,
        variant: "destructive",
      });
    },
  });

  return { deleteLead, isDeleting };
};
