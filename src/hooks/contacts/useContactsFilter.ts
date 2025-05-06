
import { useState } from "react";

export function useContactsFilter() {
  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCompanyFilter('all');
    setOwnerFilter('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    companyFilter,
    setCompanyFilter,
    ownerFilter,
    setOwnerFilter,
    showFilters,
    toggleFilters,
    handleResetFilters
  };
}
