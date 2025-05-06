
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContactWithRelations } from "@/components/contacts/ContactTableRow";

interface UseContactsParams {
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  companyFilter?: number | string;
  ownerFilter?: string;
}

interface UseContactsReturn {
  contacts: ContactWithRelations[];
  loading: boolean;
  totalPages: number;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useContacts({ 
  page, 
  pageSize, 
  sortColumn, 
  sortDirection = 'asc',
  search = '',
  companyFilter,
  ownerFilter
}: UseContactsParams): UseContactsReturn {
  const [contacts, setContacts] = useState<ContactWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate pagination parameters
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Build query
      let query = supabase
        .from('contacts')
        .select(`
          *,
          companies:associated_company_id(*),
          profiles:owner_user_id(*)
        `);
        
      // Apply search filter if provided
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,primary_phone.ilike.%${search}%,primary_email.ilike.%${search}%`);
      }
      
      // Apply company filter
      if (companyFilter !== undefined) {
        if (companyFilter === 'null') {
          query = query.is('associated_company_id', null);
        } else if (companyFilter !== 'all') {
          // Fix: Convert string to number only when needed
          const companyId = typeof companyFilter === 'string' ? parseInt(companyFilter, 10) : companyFilter;
          query = query.eq('associated_company_id', companyId);
        }
      }
      
      // Apply owner filter
      if (ownerFilter !== undefined) {
        if (ownerFilter === 'null') {
          query = query.is('owner_user_id', null);
        } else if (ownerFilter !== 'all') {
          query = query.eq('owner_user_id', ownerFilter);
        }
      }
      
      // First get the count for pagination
      const { count: totalRecords, error: countError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      setTotalCount(totalRecords || 0);
      
      // Apply sorting
      if (sortColumn) {
        // Handle special case for company name sorting
        if (sortColumn === 'companyName') {
          query = query.order('companies(company_name)', { ascending: sortDirection === 'asc' });
        } else {
          query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
        }
      } else {
        // Default sorting by contact_id descending
        query = query.order('contact_id', { ascending: false });
      }
      
      // Apply pagination
      query = query.range(from, to);
      
      // Execute query
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Transform the data
      const transformedContacts = (data || []).map(contact => {
        return {
          ...contact,
          companies: contact.companies,
          profiles: contact.profiles
        };
      });
      
      setContacts(transformedContacts);
      setError(null);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortColumn, sortDirection, search, companyFilter, ownerFilter]);
  
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return { 
    contacts, 
    loading, 
    totalPages, 
    error,
    refetch: fetchContacts
  };
}
