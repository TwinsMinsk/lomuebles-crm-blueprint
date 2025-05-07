
import React from "react";
import { useOrdersState } from "@/hooks/orders/useOrdersState";
import OrdersTable from "./OrdersTable";
import OrdersPagination from "./OrdersPagination";
import OrderFilters from "./OrderFilters";
import { toast } from "sonner";

const OrdersContent: React.FC = () => {
  const {
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
    handleApplyFilters,
    handleResetFilters,
    formatCurrency,
    formatDate,
    refetch
  } = useOrdersState();

  // Show error toast if data fetch fails
  React.useEffect(() => {
    if (isError && error) {
      toast.error(`Ошибка загрузки заказов: ${error.message}`, {
        description: "Пожалуйста, попробуйте позже или обратитесь к администратору"
      });
    }
  }, [isError, error]);

  return (
    <div className="space-y-4">
      {/* Filters section */}
      <div className="bg-card p-4 rounded-lg border">
        <h2 className="text-lg font-medium mb-4">Фильтры</h2>
        <OrderFilters 
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
      </div>
      
      {/* Orders table */}
      <OrdersTable
        orders={orders || []}
        isLoading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
      
      {/* Pagination */}
      {!isLoading && (
        <OrdersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default OrdersContent;
