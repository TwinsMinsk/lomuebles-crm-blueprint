
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  registration_date: string;
  is_active: boolean;
}

export function useUsers() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, registration_date, is_active")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (error) {
        throw error;
      }

      // Фильтруем пользователей без ID и заполняем отсутствующие имена
      return data
        .filter(user => user.id)
        .map(user => ({
          ...user,
          full_name: user.full_name || user.email || `Пользователь ${user.id?.slice(0, 8)}`
        })) as User[];
    },
  });

  return { users: users || [], isLoading, error };
}
