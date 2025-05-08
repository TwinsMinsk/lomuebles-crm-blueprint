
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types/supplier";

interface UseSuppliersOptions {
  page: number;
  limit: number;
  searchQuery: string;
  category: string | null;
}

export const useSuppliers = ({
  page,
  limit,
  searchQuery,
  category,
}: UseSuppliersOptions) => {
  const fetchSuppliers = async () => {
    let query = supabase
      .from("suppliers")
      .select("*", { count: "exact" });

    // Apply filters
    if (searchQuery) {
      query = query.or(
        `supplier_name.ilike.%${searchQuery}%,contact_person.ilike.%${searchQuery}%,product_categories.ilike.%${searchQuery}%`
      );
    }

    if (category) {
      query = query.ilike("product_categories", `%${category}%`);
    }

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Apply pagination and sorting
    const { data, error, count } = await query
      .order("creation_date", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    return {
      suppliers: data as Supplier[],
      count: count || 0,
    };
  };

  return useQuery({
    queryKey: ["suppliers", { page, limit, searchQuery, category }],
    queryFn: fetchSuppliers,
    placeholderData: previousData => previousData,
  });
};
