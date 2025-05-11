
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Fetch contacts with proper error handling
  const contactsQuery = useQuery({
    queryKey: ['orderContacts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('contact_id, full_name')
          .order('full_name');
        
        if (error) throw new Error(`Error fetching contacts: ${error.message}`);
        
        // Map to EntityOption format and ensure it always returns an array
        return Array.isArray(data) ? data.map(item => ({
          id: item.contact_id,
          name: item.full_name || `Контакт #${item.contact_id}`
        })) : [];
      } catch (err) {
        console.error("Error in contactsQuery:", err);
        return []; // Return empty array on error, not undefined
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: [] // Set initial data to empty array
  });

  // Fetch managers (users) with proper error handling
  const managersQuery = useQuery({
    queryKey: ['orderManagers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .order('full_name');
        
        if (error) throw new Error(`Error fetching managers: ${error.message}`);
        
        // Map to EntityOption format and ensure it always returns an array
        return Array.isArray(data) ? data.map(item => ({
          id: item.id,
          name: item.full_name || `Менеджер #${item.id}`
        })) : [];
      } catch (err) {
        console.error("Error in managersQuery:", err);
        return []; // Return empty array on error, not undefined
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: [] // Set initial data to empty array
  });

  // Combine all errors into a single message
  const errorMessage = contactsQuery.error || managersQuery.error 
    ? `${contactsQuery.error?.message || ''} ${managersQuery.error?.message || ''}`.trim()
    : null;

  // Debug log to track data availability
  console.log("useSimplifiedRelatedEntities", {
    contactsData: contactsQuery.data,
    managersData: managersQuery.data,
    isLoading: contactsQuery.isLoading || managersQuery.isLoading,
    error: errorMessage
  });

  // Always ensure we return arrays, even when data is loading or errors occur
  return {
    contacts: Array.isArray(contactsQuery.data) ? contactsQuery.data : [],
    managers: Array.isArray(managersQuery.data) ? managersQuery.data : [],
    isLoading: contactsQuery.isLoading || managersQuery.isLoading,
    error: errorMessage
  };
};
