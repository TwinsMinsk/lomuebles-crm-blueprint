
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export function useUsers() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (error) {
        throw error;
      }

      return data as User[];
    },
  });

  return { users: users || [], isLoading, error };
}
