
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LeadWithProfile } from "@/components/leads/LeadTableRow";

interface UseLeadsParams {
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export const useLeads = (params?: UseLeadsParams) => {
  const [leads, setLeads] = useState<LeadWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = params?.pageSize || 10;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      // First, get the total count to calculate pagination
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      // Calculate total pages
      const total = count || 0;
      setTotalPages(Math.ceil(total / itemsPerPage));

      // Fetch the leads with pagination and explicitly specify the column for the join
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          profiles:assigned_user_id(full_name)
        `)
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .order(params?.sortColumn || "creation_date", { ascending: (params?.sortDirection || "desc") === "asc" });

      if (error) {
        console.error("Error fetching leads:", error);
        return;
      }

      if (data) {
        // Transform the data to match our LeadWithProfile type with safer type handling
        const transformedData: LeadWithProfile[] = data.map(item => {
          // Ensure profiles is of the correct shape or null
          let profileData: { full_name: string | null } | null = null;
          
          // Add proper null check before accessing item.profiles
          if (item.profiles && typeof item.profiles === 'object') {
            // Check if full_name property exists in the profiles object
            const profilesObj = item.profiles as Record<string, unknown>;
            if ('full_name' in profilesObj) {
              profileData = {
                full_name: profilesObj.full_name as string | null
              };
            }
          }
          
          return {
            ...item,
            profiles: profileData
          };
        });
        
        setLeads(transformedData);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, params?.sortColumn, params?.sortDirection]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const refreshLeads = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, loading, page, totalPages, setPage, refreshLeads };
};
