
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Partner } from "@/types/partner";

export const usePartners = (
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = "company_name",
  sortOrder: "asc" | "desc" = "asc",
  searchTerm: string = ""
) => {
  const fetchPartners = async () => {
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = supabase
      .from("partners_manufacturers")
      .select("*", { count: "exact" });

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(
        `company_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (error) {
      console.error("Error fetching partners:", error);
      throw new Error(error.message);
    }

    return {
      partners: data as Partner[],
      count: count || 0,
    };
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["partners", page, pageSize, sortBy, sortOrder, searchTerm],
    queryFn: fetchPartners,
  });

  return {
    partners: data?.partners || [],
    count: data?.count || 0,
    loading: isLoading,
    error: isError ? (error as Error).message : null,
    refetch,
  };
};
