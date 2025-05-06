
import { useState } from "react";

export function usePaginationAndSort() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return {
    currentPage,
    setCurrentPage,
    sortColumn,
    sortDirection,
    handlePageChange,
    handleSort
  };
}
