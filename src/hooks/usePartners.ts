
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Partner {
  partner_manufacturer_id: number;
  company_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  specialization: string | null;
}

export function usePartners() {
  const { data: partners, isLoading, error } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_manufacturers")
        .select("partner_manufacturer_id, company_name, contact_person, phone, email, specialization")
        .order("company_name", { ascending: true });

      if (error) {
        throw error;
      }

      return data as Partner[];
    },
  });

  return { partners: partners || [], isLoading, error };
}
