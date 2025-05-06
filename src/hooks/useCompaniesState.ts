
import { useState } from "react";
import { useCompanies, useUsers, useIndustries } from "./useCompanies";

export const useCompaniesState = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("company_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch users for the owner filter
  const { users } = useUsers();
  
  // Fetch industries for the industry filter
  const { industries } = useIndustries();
  
  // Use the useCompanies hook to fetch data with filters applied
  const { companies, count, loading, refetch } = useCompanies(
    currentPage,
    10, // pageSize
    sortColumn,
    sortDirection,
    searchTerm,
    industryFilter,
    ownerFilter
  );

  // Calculate total pages based on count
  const totalPages = Math.max(1, Math.ceil(count / 10));

  // Handler for page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler for column sorting
  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setIndustryFilter("all");
    setOwnerFilter("all");
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  return {
    companies,
    loading,
    totalPages,
    currentPage,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
    refetch,
    searchTerm,
    setSearchTerm,
    industryFilter,
    setIndustryFilter,
    ownerFilter,
    setOwnerFilter,
    showFilters,
    toggleFilters,
    handleResetFilters,
    users,
    industries
  };
};
