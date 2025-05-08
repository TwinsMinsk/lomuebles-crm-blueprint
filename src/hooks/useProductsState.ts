
import { useState } from "react";
import { useProducts } from "./useProducts";
import { ProductFilters } from "@/types/product";

export const useProductsState = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: null,
    isCustomTemplate: null,
  });

  const { data, isLoading, refetch } = useProducts({
    page,
    limit,
    searchQuery: filters.search,
    category: filters.category,
    isCustomTemplate: filters.isCustomTemplate,
  });

  const products = data?.products || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    products,
    loading: isLoading,
    totalCount,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    refetchProducts: refetch,
  };
};
