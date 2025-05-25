
import React from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useOrdersKanban } from "@/hooks/orders/useOrdersKanban";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";
import OrderCard from "./OrderCard";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Function to get column header styling based on status and order type
const getStatusColumnStyles = (status: string, orderType: string) => {
  // Default styles
  let bgClass = "bg-slate-100";
  let textClass = "text-slate-700";

  if (orderType === "Мебель на заказ") {
    switch (status) {
      // Initial stages (neutral)
      case "Новый запрос":
        bgClass = "bg-slate-100";
        textClass = "text-slate-700";
        break;
      
      // Planning stages (light green)
      case "Предварительная оценка":
      case "Согласование ТЗ/Дизайна":
        bgClass = "bg-emerald-50";
        textClass = "text-emerald-700";
        break;
      
      // Preparation stages (green tones)
      case "Ожидает замера":
      case "Замер выполнен":
        bgClass = "bg-green-100";
        textClass = "text-green-700";
        break;
      
      // Work stages (more saturated green)
      case "Проектирование":
      case "Согласование проекта":
      case "Ожидает предоплаты":
        bgClass = "bg-green-200";
        textClass = "text-green-800";
        break;
      
      // Production stages (bright green)
      case "В производстве":
      case "Готов к монтажу":
        bgClass = "bg-green-400";
        textClass = "text-white";
        break;
      
      // Completion stages (brand green)
      case "Монтаж":
      case "Завершен":
        bgClass = "bg-[#8bd60e]";
        textClass = "text-white";
        break;
      
      // Cancelled
      case "Отменен":
        bgClass = "bg-red-100";
        textClass = "text-red-700";
        break;
    }
  } else if (orderType === "Готовая мебель (Tilda)") {
    switch (status) {
      // Initial stages (neutral)
      case "Новый":
        bgClass = "bg-slate-100";
        textClass = "text-slate-700";
        break;
      
      // Planning stages (light blue-green)
      case "Ожидает подтверждения":
        bgClass = "bg-emerald-50";
        textClass = "text-emerald-700";
        break;
      
      // Payment stages (green tones)
      case "Ожидает оплаты":
      case "Оплачен":
        bgClass = "bg-green-100";
        textClass = "text-green-700";
        break;
      
      // Assembly stages (more saturated green)
      case "Передан на сборку":
        bgClass = "bg-green-200";
        textClass = "text-green-800";
        break;
      
      // Delivery stages (bright green)
      case "Готов к отгрузке":
      case "В доставке":
        bgClass = "bg-green-400";
        textClass = "text-white";
        break;
      
      // Completion stages (brand green)
      case "Выполнен":
        bgClass = "bg-[#8bd60e]";
        textClass = "text-white";
        break;
      
      // Cancelled
      case "Отменен":
        bgClass = "bg-red-100";
        textClass = "text-red-700";
        break;
    }
  }

  return { bgClass, textClass };
};

const OrdersKanbanBoard: React.FC = () => {
  const { 
    kanbanData, 
    selectedOrderType, 
    setSelectedOrderType, 
    moveOrder, 
    isLoading, 
    isUpdating 
  } = useOrdersKanban();
  
  const { orderTypes } = useFilterOptions();

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If the order was moved to a different status column
    if (destination.droppableId !== source.droppableId) {
      const newStatus = destination.droppableId;
      const orderId = parseInt(draggableId);
      
      // Update the order status
      await moveOrder(orderId, newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-64">
          <Select
            value={selectedOrderType}
            onValueChange={setSelectedOrderType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип заказа" />
            </SelectTrigger>
            <SelectContent>
              {orderTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto pb-6">
          {kanbanData.columns.map((column) => {
            const { bgClass, textClass } = getStatusColumnStyles(column.id, selectedOrderType);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${bgClass} ${textClass} p-2 rounded-t-md`}>
                  <h3 className="font-medium text-sm">{column.title}</h3>
                  <div className="text-xs opacity-75">
                    {column.orderIds.length} заказ(ов)
                  </div>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        flex-1 p-2 min-h-[150px] rounded-b-md
                        ${snapshot.isDraggingOver ? "bg-accent/50" : "bg-muted/50"}
                      `}
                      style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}
                    >
                      {column.orderIds.map((orderId, index) => {
                        const order = kanbanData.ordersMap[orderId];
                        return order ? (
                          <OrderCard 
                            key={order.id} 
                            order={order} 
                            index={index} 
                          />
                        ) : null;
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
      
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-md shadow-lg z-50 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Updating...
        </div>
      )}
    </div>
  );
};

export default OrdersKanbanBoard;
