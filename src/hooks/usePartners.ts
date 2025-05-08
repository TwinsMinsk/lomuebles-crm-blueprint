
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Partner } from "@/types/partner";

interface UsePartnersOptions {
  page?: number;
  limit?: number;
  searchQuery?: string;
  specialization?: string | null;
}

export function usePartners(options: UsePartnersOptions = {}) {
  const { searchQuery, specialization } = options;
  
  const { data: partners, isLoading, error, refetch } = useQuery({
    queryKey: ["partners", { searchQuery, specialization }],
    queryFn: async () => {
      let query = supabase
        .from("partners_manufacturers")
        .select("*")
        .order("company_name", { ascending: true });

      // Apply filters
      if (searchQuery) {
        query = query.or(
          `company_name.ilike.%${searchQuery}%,contact_person.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%`
        );
      }

      if (specialization) {
        query = query.ilike("specialization", `%${specialization}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Partner[];
    },
  });

  return { partners: partners || [], isLoading, error, refetch };
}
