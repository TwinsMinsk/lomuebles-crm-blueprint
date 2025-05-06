
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

export type Company = Database["public"]["Tables"]["companies"]["Row"] & {
  owner_name?: string | null;
};

export const useCompanies = (
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = "company_id",
  sortOrder: "asc" | "desc" = "asc"
) => {
  const fetchCompanies = async (): Promise<{
    companies: Company[];
    count: number;
  }> => {
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch companies with owner name from profiles
    const { data: companies, error, count } = await supabase
      .from("companies")
      .select(
        `
        *,
        profiles:owner_user_id (
          full_name
        )
        `,
        { count: "exact" }
      )
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (error) {
      console.error("Error fetching companies:", error);
      throw new Error(error.message);
    }

    // Transform data to include owner_name
    const transformedCompanies = companies.map((company) => {
      const ownerProfile = company.profiles as
        | { full_name: string | null }
        | null;
      return {
        ...company,
        owner_name: ownerProfile?.full_name || null,
        profiles: undefined // Remove the profiles data from the result
      };
    }) as Company[];

    return {
      companies: transformedCompanies,
      count: count || 0,
    };
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["companies", page, pageSize, sortBy, sortOrder],
    queryFn: fetchCompanies,
  });

  return {
    companies: data?.companies || [],
    count: data?.count || 0,
    loading: isLoading,
    error: isError ? (error as Error).message : null,
    refetch,
  };
};
