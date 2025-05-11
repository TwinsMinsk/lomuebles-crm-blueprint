
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

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
  
  useEffect(() => {
    // Log authentication status to help debugging
    console.log("SimplifiedRelatedEntities hook - Auth status:", {
      isAuthenticated: !!session,
      userId: session?.user?.id || null
    });
  }, [session]);
  
  // Fetch contacts with proper error handling
  const contactsQuery = useQuery({
    queryKey: ['orderContacts'],
    queryFn: async () => {
      try {
        console.log("Fetching contacts, auth status:", !!session);
        
        if (!session) {
          console.warn("No active session, cannot fetch contacts");
          return [];
        }
        
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
        throw err; // Let React Query handle the error
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
        
        if (!session) {
          console.warn("No active session, cannot fetch managers");
          return [];
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, is_active')
          .eq('is_active', true) // Only fetch active managers
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
        throw err; // Let React Query handle the error
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

  // Show toast for errors
  useEffect(() => {
    if (contactsError || managersError) {
      toast.error("Ошибка загрузки данных", {
        description: "Не удалось загрузить связанные сущности"
      });
    }
  }, [contactsError, managersError]);

  // Debug log to track data availability
  console.log("useSimplifiedRelatedEntities results:", {
    contactsData: contactsQuery.data,
    contactsLength: contactsQuery.data?.length || 0,
    contactsStatus: contactsQuery.status,
    managersData: managersQuery.data,
    managersLength: managersQuery.data?.length || 0,
    managersStatus: managersQuery.status,
    isLoading: contactsQuery.isLoading || managersQuery.isLoading,
    error: errorMessage,
    authStatus: !!session
  });

  // Always ensure we return arrays, even when data is loading or errors occur
  return {
    contacts: contactsQuery.data || [],
    managers: managersQuery.data || [],
    isLoading: contactsQuery.isLoading || managersQuery.isLoading,
    error: errorMessage
  };
};
