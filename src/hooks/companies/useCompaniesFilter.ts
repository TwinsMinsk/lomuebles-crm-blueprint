
import { useState } from "react";

export function useCompaniesFilter() {
  // Filtering state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setIndustryFilter("all");
    setOwnerFilter("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    industryFilter,
    setIndustryFilter,
    ownerFilter,
    setOwnerFilter,
    showFilters,
    toggleFilters,
    handleResetFilters
  };
}
