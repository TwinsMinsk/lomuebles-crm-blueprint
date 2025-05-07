
import React from "react";
import { useOrdersState } from "@/hooks/orders/useOrdersState";
import OrdersTable from "./OrdersTable";
import OrdersPagination from "./OrdersPagination";
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
