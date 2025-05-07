
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrders } from "../useOrders";

export interface OrderFilters {
  search?: string;
  orderType?: string;
  currentStatus?: string;
  assignedUserId?: string;
  paymentStatus?: string;
  fromDate?: Date;
  toDate?: Date;
}

export function useOrdersState() {
  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>("creation_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Filtering state
  const [filters, setFilters] = useState<OrderFilters>({});

  const { fetchOrders, totalCount, formatCurrency, formatDate } = useOrders();

  // Query to fetch orders with current pagination, sorting, and filtering
  const { 
    data: orders, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["orders", currentPage, pageSize, sortColumn, sortDirection, filters],
    queryFn: () => fetchOrders({
      page: currentPage,
      pageSize,
      sortColumn,
      sortDirection,
      filters
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

  // Handle filters
  const handleApplyFilters = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
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
    filters,
    handleApplyFilters,
    handleResetFilters,
    formatCurrency,
    formatDate,
    refetch
  };
}
