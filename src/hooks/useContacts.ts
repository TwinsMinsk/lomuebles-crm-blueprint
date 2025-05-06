
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContactWithRelations } from "@/components/contacts/ContactTableRow";

interface UseContactsParams {
  page: number;
  pageSize: number;
}

interface UseContactsReturn {
  contacts: ContactWithRelations[];
  loading: boolean;
  totalPages: number;
  error: Error | null;
}

export function useContacts({ page, pageSize }: UseContactsParams): UseContactsReturn {
  const [contacts, setContacts] = useState<ContactWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true);
        
        // Calculate pagination parameters
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        // First, get the total count for pagination
        const countResponse = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true });
          
        if (countResponse.error) throw countResponse.error;
        
        // Set total count from response
        const total = countResponse.count || 0;
        setTotalCount(total);
        
        // Now fetch the actual data with joins
        const { data, error } = await supabase
          .from('contacts')
          .select(`
            *,
            companies:associated_company_id(*),
            profiles:owner_user_id(*)
          `)
          .order('contact_id', { ascending: false })
          .range(from, to);
          
        if (error) throw error;
        
        // Transform the data to match our expected types
        const transformedContacts = data.map(contact => {
          return {
            ...contact,
            companies: contact.companies,
            profiles: contact.profiles
          };
        });
        
        setContacts(transformedContacts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchContacts();
  }, [page, pageSize]);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return { contacts, loading, totalPages, error };
}
