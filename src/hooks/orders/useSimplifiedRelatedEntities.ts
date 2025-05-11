
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export interface EntityOption {
  id: number | string;
  name: string;
}

export interface SimplifiedRelatedEntitiesData {
  contacts: EntityOption[];
  managers: EntityOption[];
  isLoading: boolean;
  error: string | null;
}

export const useSimplifiedRelatedEntities = (): SimplifiedRelatedEntitiesData => {
  const { session } = useAuth();
  
  // Fetch contacts with proper error handling
  const contactsQuery = useQuery({
    queryKey: ['orderContacts'],
    queryFn: async () => {
      try {
        console.log("Fetching contacts, auth status:", !!session);
        
        const { data, error } = await supabase
          .from('contacts')
          .select('contact_id, full_name')
          .order('full_name');
        
        if (error) {
          console.error("Error fetching contacts:", error);
          throw new Error(`Error fetching contacts: ${error.message}`);
        }
        
        console.log("Retrieved contacts data:", data);
        
        // Map to EntityOption format and ensure it always returns an array
        return Array.isArray(data) ? data.map(item => ({
          id: item.contact_id,
          name: item.full_name || `Контакт #${item.contact_id}`
        })) : [];
      } catch (err) {
        console.error("Error in contactsQuery:", err);
        toast.error("Не удалось загрузить контакты", {
          description: "Проверьте соединение и права доступа"
        });
        return []; // Return empty array on error, not undefined
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: [], // Set initial data to empty array
    enabled: !!session // Only run when user is authenticated
  });

  // Fetch managers (users) with proper error handling
  const managersQuery = useQuery({
    queryKey: ['orderManagers'],
    queryFn: async () => {
      try {
        console.log("Fetching managers, auth status:", !!session);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name');
        
        if (error) {
          console.error("Error fetching managers:", error);
          throw new Error(`Error fetching managers: ${error.message}`);
        }
        
        console.log("Retrieved managers data:", data);
        
        // Map to EntityOption format and ensure it always returns an array
        return Array.isArray(data) ? data.map(item => ({
          id: item.id,
          name: item.full_name || item.email || `Менеджер #${item.id}`
        })) : [];
      } catch (err) {
        console.error("Error in managersQuery:", err);
        toast.error("Не удалось загрузить менеджеров", {
          description: "Проверьте соединение и права доступа"
        });
        return []; // Return empty array on error, not undefined
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: [], // Set initial data to empty array
    enabled: !!session // Only run when user is authenticated
  });

  // Combine all errors into a single message
  const errorMessage = contactsQuery.error || managersQuery.error 
    ? `${contactsQuery.error?.message || ''} ${managersQuery.error?.message || ''}`.trim()
    : null;

  // Debug log to track data availability
  console.log("useSimplifiedRelatedEntities results:", {
    contactsData: contactsQuery.data,
    contactsLength: contactsQuery.data?.length || 0,
    managersData: managersQuery.data,
    managersLength: managersQuery.data?.length || 0,
    isLoading: contactsQuery.isLoading || managersQuery.isLoading,
    error: errorMessage,
    authStatus: !!session
  });

  // Always ensure we return arrays, even when data is loading or errors occur
  return {
    contacts: Array.isArray(contactsQuery.data) ? contactsQuery.data : [],
    managers: Array.isArray(managersQuery.data) ? managersQuery.data : [],
    isLoading: contactsQuery.isLoading || managersQuery.isLoading,
    error: errorMessage
  };
};
