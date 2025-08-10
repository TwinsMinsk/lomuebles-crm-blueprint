
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { TaskRelatedDetailsResponse } from "@/types/taskRelatedDetails";

export const useTaskRelatedDetails = (taskId: number | null | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["taskRelatedDetails", taskId],
    queryFn: async (): Promise<TaskRelatedDetailsResponse | null> => {
      if (!taskId || !user) {
        return null;
      }

      console.log("Fetching task related details for task:", taskId);

      const { data, error } = await supabase.rpc('get_task_related_details', {
        p_task_id: taskId
      });

      if (error) {
        console.error("Error fetching task related details:", error);
        throw new Error(`Failed to fetch task related details: ${error.message}`);
      }

      console.log("Task related details fetched:", data);
      
      // Convert the Json type to our expected interface through unknown
      return data as unknown as TaskRelatedDetailsResponse;
    },
    enabled: !!taskId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on access denied errors
      if (error?.message?.includes('Access denied')) {
        return false;
      }
      return failureCount < 3;
    }
  });
};
