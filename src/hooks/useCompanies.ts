
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
  sortOrder: "asc" | "desc" = "asc",
  searchTerm: string = "",
  industryFilter: string = "all",
  ownerFilter: string = "all"
) => {
  const fetchCompanies = async (): Promise<{
    companies: Company[];
    count: number;
  }> => {
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = supabase
      .from("companies")
      .select(
        `
        *,
        profiles:owner_user_id (
          full_name
        )
        `,
        { count: "exact" }
      );

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(
        `company_name.ilike.%${searchTerm}%,nif_cif.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    // Apply industry filter if provided and not "all"
    if (industryFilter && industryFilter !== "all") {
      query = query.eq("industry", industryFilter);
    }

    // Apply owner filter
    if (ownerFilter === "null") {
      query = query.is("owner_user_id", null);
    } else if (ownerFilter !== "all") {
      query = query.eq("owner_user_id", ownerFilter);
    }

    // Apply sorting and pagination
    const { data: companies, error, count } = await query
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
    queryKey: ["companies", page, pageSize, sortBy, sortOrder, searchTerm, industryFilter, ownerFilter],
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

// Function to fetch users for the owner filter
export const useUsers = () => {
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("role", ["Менеджер", "Администратор", "Главный Администратор"]);

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error(error.message);
    }

    return data || [];
  };

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return {
    users: data || [],
    loading: isLoading,
  };
};

// Function to fetch unique industry values
export const useIndustries = () => {
  const fetchIndustries = async () => {
    // Predefined industry options
    const predefinedIndustries = [
      { value: "Розничная торговля", label: "Розничная торговля" },
      { value: "Дизайн интерьера", label: "Дизайн интерьера" },
      { value: "Строительство", label: "Строительство" },
      { value: "Другое", label: "Другое" },
    ];
    
    // You could also fetch unique industry values from the database
    // but we'll use predefined values for now
    
    return predefinedIndustries;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["industries"],
    queryFn: fetchIndustries,
  });

  return {
    industries: data || [],
    loading: isLoading,
  };
};
