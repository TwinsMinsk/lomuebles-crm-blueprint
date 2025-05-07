
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CustomRequest {
  custom_request_id: number;
  request_name: string | null;
  client_description: string | null;
  request_status: string | null;
  creation_date: string;
}

export function useCustomRequests() {
  const { data: customRequests, isLoading, error } = useQuery({
    queryKey: ["customRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_requests")
        .select("custom_request_id, request_name, client_description, request_status, creation_date")
        .order("creation_date", { ascending: false });

      if (error) {
        throw error;
      }

      return data as CustomRequest[];
    },
  });

  return { customRequests: customRequests || [], isLoading, error };
}
