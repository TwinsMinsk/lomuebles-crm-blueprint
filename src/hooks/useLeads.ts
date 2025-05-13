
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadWithProfile } from '@/components/leads/LeadTableRow';
import { toast } from '@/hooks/use-toast';

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
      
      // Fetch leads for the current page - without trying to join with profiles yet
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('creation_date', { ascending: false })
        .range(from, to);

      if (leadsError) throw leadsError;
      
      // Now for each lead, if assigned_user_id exists, fetch the profile separately
      const leadsWithProfiles = await Promise.all(
        leadsData.map(async (lead) => {
          let profileData = null;
          
          if (lead.assigned_user_id) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', lead.assigned_user_id)
              .single();
              
            if (!profileError && profile) {
              profileData = profile;
            }
          }
          
          return {
            ...lead,
            profiles: profileData
          } as LeadWithProfile;
        })
      );
      
      setLeads(leadsWithProfiles);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Show error toast
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список лидов",
        variant: "destructive"
      });
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
