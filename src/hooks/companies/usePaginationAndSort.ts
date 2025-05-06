
import { useState } from "react";

export function usePaginationAndSort() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("company_id");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Handle pagination change
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

  // Calculate total pages based on count
  const calculateTotalPages = (count: number, pageSize: number) => {
    return Math.max(1, Math.ceil(count / pageSize));
  };

  return {
    currentPage,
    setCurrentPage,
    sortColumn,
    sortDirection,
    handlePageChange,
    handleSort,
    calculateTotalPages
  };
}
