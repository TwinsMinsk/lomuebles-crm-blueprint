
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadWithProfile } from '@/components/leads/LeadTableRow';
import { toast } from '@/hooks/use-toast';

interface UseLeadsParams {
  page?: number;
  pageSize?: number;
}

export const useLeads = ({ page = 1, pageSize = 10 }: UseLeadsParams = {}) => {
  const {
    data: leadsData,
    isLoading: loading,
    error,
    refetch: refreshLeads
  } = useQuery({
    queryKey: ['leads', page, pageSize],
    queryFn: async () => {
      console.log(`Fetching leads for page ${page}, pageSize ${pageSize}`);
      
      // Calculate the range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get count of total leads for pagination
      const { count, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error fetching leads count:', countError);
        throw countError;
      }
      
      // Fetch leads for the current page
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('creation_date', { ascending: false })
        .range(from, to);

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw leadsError;
      }
      
      // For each lead, if assigned_user_id exists, fetch the profile separately
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
      
      console.log(`Successfully fetched ${leadsWithProfiles.length} leads`);
      
      return {
        leads: leadsWithProfiles,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error('Error in useLeads query:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список лидов",
          variant: "destructive"
        });
      }
    }
  });

  return {
    leads: leadsData?.leads || [],
    loading,
    error,
    totalPages: leadsData?.totalPages || 1,
    refreshLeads
  };
};
