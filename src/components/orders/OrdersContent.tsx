
import React, { useState } from "react";
import { useOrdersState } from "@/hooks/orders/useOrdersState";
import OrdersTable from "./OrdersTable";
import OrdersPagination from "./OrdersPagination";
import OrderFilters from "./OrderFilters";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanSquare, List } from "lucide-react";
import OrdersKanbanBoard from "./kanban/OrdersKanbanBoard";
import { useNavigate } from "react-router-dom";

const OrdersContent: React.FC = () => {
  const [view, setView] = useState<"table" | "kanban">("table");
  const navigate = useNavigate();
  
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

  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="table" onValueChange={(v) => setView(v as "table" | "kanban")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              Таблица
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-1">
              <KanbanSquare className="h-4 w-4" />
              Канбан
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="space-y-4">
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
            onOrderClick={handleOrderClick}
          />
          
          {/* Pagination */}
          {!isLoading && (
            <OrdersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </TabsContent>

        <TabsContent value="kanban">
          <OrdersKanbanBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersContent;
