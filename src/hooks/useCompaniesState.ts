
import { useState } from "react";
import { useCompanies } from "./useCompanies";

export const useCompaniesState = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>("company_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Use the useCompanies hook to fetch data
  const { companies, count, loading, refetch } = useCompanies(
    currentPage,
    10, // pageSize
    sortColumn,
    sortDirection
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
  };
};
