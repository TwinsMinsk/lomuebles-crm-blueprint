
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadWithProfile } from '@/components/leads/LeadTableRow';

export const useLeads = () => {
  const [leads, setLeads] = useState<LeadWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Number of leads per page

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate the range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get count of total leads for pagination
      const { count, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Set total pages based on count
      setTotalPages(Math.ceil((count || 0) / pageSize));
      
      // Fetch leads with profiles for the current page
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          profiles:assigned_user_id(*)
        `)
        .order('creation_date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setLeads(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { 
    leads, 
    loading, 
    error, 
    page, 
    setPage, 
    totalPages,
    refreshLeads: fetchLeads 
  };
};
