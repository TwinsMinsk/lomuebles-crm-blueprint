
import { useState } from "react";
import { useSuppliers } from "./useSuppliers";
import { SupplierFilters } from "@/types/supplier";

export const useSuppliersState = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState<SupplierFilters>({
    search: "",
    category: null,
  });

  const { data, isLoading, refetch } = useSuppliers({
    page,
    limit,
    searchQuery: filters.search,
    category: filters.category,
  });

  const suppliers = data?.suppliers || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    suppliers,
    loading: isLoading,
    totalCount,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    refetchSuppliers: refetch,
  };
};
