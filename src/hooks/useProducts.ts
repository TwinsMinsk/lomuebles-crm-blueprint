
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface UseProductsOptions {
  page: number;
  limit: number;
  searchQuery: string;
  category: string | null;
  isCustomTemplate: string | null;
}

export const useProducts = ({
  page,
  limit,
  searchQuery,
  category,
  isCustomTemplate,
}: UseProductsOptions) => {
  const fetchProducts = async () => {
    let query = supabase
      .from("products")
      .select("*", { count: "exact" });

    // Apply filters
    if (searchQuery) {
      query = query.or(
        `internal_product_name.ilike.%${searchQuery}%,internal_sku.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (isCustomTemplate !== null) {
      query = query.eq("is_custom_template", isCustomTemplate === "true");
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
      products: data as Product[],
      count: count || 0,
    };
  };

  return useQuery({
    queryKey: ["products", { page, limit, searchQuery, category, isCustomTemplate }],
    queryFn: fetchProducts,
    placeholderData: keepPreviousData => keepPreviousData,
  });
};
