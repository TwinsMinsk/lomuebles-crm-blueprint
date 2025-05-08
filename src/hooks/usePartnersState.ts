
import { useState } from "react";
import { usePartners } from "./usePartners";
import { PartnerFilters } from "@/types/partner";

export const usePartnersState = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState<PartnerFilters>({
    search: "",
    specialization: null,
  });

  const { partners, isLoading, error, refetch } = usePartners({
    page,
    limit,
    searchQuery: filters.search,
    specialization: filters.specialization,
  });

  const totalCount = partners?.length || 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  // Paginate partners manually since the backend doesn't support it yet
  const paginatedPartners = partners?.slice((page - 1) * limit, page * limit) || [];

  return {
    partners: paginatedPartners,
    loading: isLoading,
    error,
    totalCount,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    refetchPartners: refetch,
  };
};
