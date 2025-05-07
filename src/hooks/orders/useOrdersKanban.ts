
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/hooks/useOrders";
import { toast } from "sonner";
import { DropResult } from "@hello-pangea/dnd";

interface KanbanColumn {
  title: string;
  items: Order[];
}

interface KanbanColumns {
  [key: string]: KanbanColumn;
}

export function useOrdersKanban() {
  const [orderTypes] = useState<string[]>([
    "Готовая мебель (Tilda)",
    "Мебель на заказ",
  ]);
  const [currentOrderType, setCurrentOrderType] = useState<string>(orderTypes[0]);
  const [columns, setColumns] = useState<KanbanColumns>({});
  const queryClient = useQueryClient();

  // Fetch orders for the current order type
  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["kanban-orders", currentOrderType],
    queryFn: async () => {
      const statusField = currentOrderType === "Готовая мебель (Tilda)" 
        ? "status_ready_made" 
        : "status_custom_made";
      
      const { data, error } = await supabase
        .from("deals_orders")
        .select(`
          *,
          contacts:associated_contact_id (full_name),
          companies:associated_company_id (company_name),
          profiles:assigned_user_id (full_name)
        `)
        .eq("order_type", currentOrderType)
        .not(statusField, "is", null)
        .order("creation_date", { ascending: false });

      if (error) {
        console.error("Error fetching kanban orders:", error);
        toast.error("Ошибка при загрузке заказов для Канбан-доски");
        throw error;
      }

      // Transform the data to match our Order interface
      return data.map((order: any) => ({
        ...order,
        contact_name: order.contacts?.full_name || "Не указан",
        company_name: order.companies?.company_name || "Не указана",
        manager_name: order.profiles?.full_name || "Не назначен",
        current_status: order.order_type === "Готовая мебель (Tilda)" 
          ? order.status_ready_made 
          : order.status_custom_made
      }));
    }
  });

  // Mutation to update order status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ 
      orderId, 
      newStatus, 
      orderType 
    }: { 
      orderId: number; 
      newStatus: string; 
      orderType: string 
    }) => {
      const statusField = orderType === "Готовая мебель (Tilda)"
        ? "status_ready_made"
        : "status_custom_made";
      
      const { error } = await supabase
        .from("deals_orders")
        .update({ [statusField]: newStatus })
        .eq("deal_order_id", orderId);

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("Ошибка при обновлении статуса заказа");
    }
  });

  // Organize orders into columns by status
  useEffect(() => {
    if (!orders) return;

    // Determine which status field to use based on order type
    const statusField = currentOrderType === "Готовая мебель (Tilda)"
      ? "status_ready_made"
      : "status_custom_made";

    // Group orders by status
    const groupedOrders: { [key: string]: Order[] } = {};
    
    orders.forEach(order => {
      const status = order[statusField as keyof Order] as string;
      if (!status) return;
      
      if (!groupedOrders[status]) {
        groupedOrders[status] = [];
      }
      
      groupedOrders[status].push(order);
    });

    // Create columns object
    const newColumns: KanbanColumns = {};
    
    Object.entries(groupedOrders).forEach(([status, items]) => {
      newColumns[status] = {
        title: status,
        items
      };
    });

    setColumns(newColumns);
  }, [orders, currentOrderType]);

  // Handle drag end event
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Return if dropped outside a droppable area or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Get source and destination columns
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    
    // If the order is moved to a different column, update its status
    if (source.droppableId !== destination.droppableId) {
      const orderId = parseInt(draggableId);
      const newStatus = destination.droppableId;

      // Optimistically update the UI
      const newColumns = { ...columns };
      const [movedItem] = sourceColumn.items.splice(source.index, 1);
      
      // Update the item's status
      const statusField = currentOrderType === "Готовая мебель (Tilda)"
        ? "status_ready_made"
        : "status_custom_made";
      
      const updatedItem = {
        ...movedItem,
        [statusField]: newStatus
      };

      // Add the item to the destination column
      destColumn.items.splice(destination.index, 0, updatedItem);
      
      setColumns(newColumns);

      // Send the update to the database
      updateOrderStatus.mutate({ 
        orderId, 
        newStatus, 
        orderType: currentOrderType 
      });

      toast.success(`Статус заказа ${movedItem.order_number} изменен на "${newStatus}"`);
    } else {
      // Only reordering within the same column (no status change)
      const newItems = [...sourceColumn.items];
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);
      
      const newColumns = {
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: newItems
        }
      };
      
      setColumns(newColumns);
    }
  }, [columns, currentOrderType, updateOrderStatus]);

  const refreshData = useCallback(() => {
    refetch();
    toast.success("Данные обновлены");
  }, [refetch]);

  return {
    columns,
    orders,
    orderTypes,
    isLoading,
    currentOrderType,
    setCurrentOrderType,
    handleDragEnd,
    refreshData
  };
}
