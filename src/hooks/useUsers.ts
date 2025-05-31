
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  registration_date: string;
  is_active: boolean;
}

export function useUsers() {
  const { user: currentUser, userRole } = useAuth();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users", userRole],
    queryFn: async () => {
      console.log("useUsers query starting for role:", userRole);
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, full_name, role, registration_date, is_active")
          .eq("is_active", true)
          .order("full_name", { ascending: true });

        if (error) {
          console.error("Supabase error in useUsers:", error);
          throw error;
        }

        console.log("useUsers query result:", { count: data?.length, data });

        // Filter and enhance user data
        const processedUsers = data
          .filter(user => user.id)
          .map(user => ({
            ...user,
            full_name: user.full_name || user.email || `Пользователь ${user.id?.slice(0, 8)}`
          })) as User[];

        return processedUsers;
      } catch (error) {
        console.error("useUsers query failed:", error);
        // For specialists or when there's an RLS issue, return at least the current user
        if (currentUser) {
          return [{
            id: currentUser.id,
            email: currentUser.email || "",
            full_name: currentUser.user_metadata?.full_name || currentUser.email || `Пользователь ${currentUser.id.slice(0, 8)}`,
            role: userRole || "",
            registration_date: currentUser.created_at || "",
            is_active: true
          }] as User[];
        }
        throw error;
      }
    },
    // Always enable this query, but handle errors gracefully
    enabled: !!currentUser,
    // Add some retry logic for RLS issues
    retry: (failureCount, error: any) => {
      console.log("useUsers retry attempt:", failureCount, error?.message);
      // Don't retry RLS permission errors, but retry network errors
      if (error?.code === '42501' || error?.message?.includes('permission')) {
        return false;
      }
      return failureCount < 2;
    },
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  return { 
    users: users || [], 
    isLoading, 
    error: error as Error | null 
  };
}
