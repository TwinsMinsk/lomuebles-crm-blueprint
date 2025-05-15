
import { useState } from "react";
import { useOrders } from "@/hooks/orders/useOrders";
import { useUpdateOrder } from "@/hooks/orders/useUpdateOrder";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";
import { Order } from "@/types/order";
import { toast } from "sonner";

export type KanbanColumn = {
  id: string;
  title: string;
  orderIds: number[];
};

export type KanbanData = {
  columns: KanbanColumn[];
  ordersMap: Record<number, Order>;
};

export const useOrdersKanban = () => {
  const { data: orders, isLoading, error } = useOrders();
  const { updateOrder, isLoading: isUpdating } = useUpdateOrder();
  const { readyMadeStatuses, customMadeStatuses } = useFilterOptions();
  
  const [selectedOrderType, setSelectedOrderType] = useState<string>("Мебель на заказ");

  // Get applicable statuses based on the selected order type
  const getApplicableStatuses = () => {
    return selectedOrderType === "Готовая мебель (Tilda)" 
      ? readyMadeStatuses 
      : customMadeStatuses;
  };

  // Group orders by status for the kanban board
  const getKanbanData = (): KanbanData => {
    if (!orders) {
      return { columns: [], ordersMap: {} };
    }

    // Filter orders by selected order type
    const filteredOrders = orders.filter(order => order.order_type === selectedOrderType);
    
    // Create a map of orders for quick lookup
    const ordersMap: Record<number, Order> = {};
    filteredOrders.forEach(order => {
      ordersMap[order.id] = order;
    });

    // Get applicable statuses for this order type
    const statuses = getApplicableStatuses();
    
    // Create columns for each status
    const columns: KanbanColumn[] = statuses.map(status => {
      const orderIds = filteredOrders
        .filter(order => order.status === status)
        .map(order => order.id);
      
      return {
        id: status,
        title: status,
        orderIds
      };
    });
    
    return { columns, ordersMap };
  };

  // Handle moving an order from one status to another
  const moveOrder = async (orderId: number, newStatus: string) => {
    try {
      const order = orders?.find(o => o.id === orderId);
      
      if (!order) {
        throw new Error("Order not found");
      }
      
      await updateOrder({
        orderId,
        orderData: { status: newStatus }
      });
      
      return true;
    } catch (err: any) {
      toast.error(`Failed to update order status: ${err.message}`);
      return false;
    }
  };

  return {
    kanbanData: getKanbanData(),
    selectedOrderType,
    setSelectedOrderType,
    moveOrder,
    isLoading,
    isUpdating,
    error
  };
};
