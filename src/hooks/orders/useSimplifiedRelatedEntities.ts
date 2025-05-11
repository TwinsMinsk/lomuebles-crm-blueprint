
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
        if (!session) {
          return [];
        }
        
        const { data, error } = await supabase
          .from('contacts')
          .select('contact_id, full_name')
          .order('full_name');
        
        if (error) {
          throw new Error(`Error fetching contacts: ${error.message}`);
        }
        
        // Map to EntityOption format
        return Array.isArray(data) ? data.map(item => ({
          id: item.contact_id,
          name: item.full_name || `Контакт #${item.contact_id}`
        })) : [];
      } catch (err) {
        throw err;
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
        if (!session) {
          return [];
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, is_active')
          .eq('is_active', true) // Only fetch active managers
          .order('full_name');
        
        if (error) {
          throw new Error(`Error fetching managers: ${error.message}`);
        }
        
        // Map to EntityOption format
        return Array.isArray(data) ? data.map(item => ({
          id: item.id,
          name: item.full_name || item.email || `Менеджер #${item.id}`
        })) : [];
      } catch (err) {
        throw err;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: [], // Set initial data to empty array
    enabled: !!session // Only run when user is authenticated
  });

  // Handle errors from React Query
  const contactsError = contactsQuery.error ? `${(contactsQuery.error as Error).message}` : null;
  const managersError = managersQuery.error ? `${(managersQuery.error as Error).message}` : null;
  
  // Combine errors or return null if no errors
  const errorMessage = contactsError || managersError ? `${contactsError || ''} ${managersError || ''}`.trim() : null;

  // Always ensure we return arrays, even when data is loading or errors occur
  return {
    contacts: contactsQuery.data || [],
    managers: managersQuery.data || [],
    isLoading: contactsQuery.isLoading || managersQuery.isLoading,
    error: errorMessage
  };
};
