
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrders } from "../useOrders";

export function useOrdersState() {
  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>("creation_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { fetchOrders, totalCount, formatCurrency, formatDate } = useOrders();

  // Query to fetch orders with current pagination and sorting
  const { 
    data: orders, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["orders", currentPage, pageSize, sortColumn, sortDirection],
    queryFn: () => fetchOrders({
      page: currentPage,
      pageSize,
      sortColumn,
      sortDirection
    })
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sort
  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    orders,
    isLoading,
    isError,
    error,
    currentPage,
    totalPages,
    handlePageChange,
    handleSort,
    sortColumn,
    sortDirection,
    formatCurrency,
    formatDate,
    refetch
  };
}
