import React from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useOrdersKanban } from "@/hooks/orders/useOrdersKanban";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";
import OrderCard from "./OrderCard";
import CompactEmptyState from "./CompactEmptyState";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FilePlus, ClipboardList, FileCheck, Clock, CheckCircle, XCircle, Compass, Wrench, Package, Truck } from "lucide-react";

// Function to get the appropriate icon for each status
const getStatusIcon = (status: string) => {
  const iconProps = { className: "h-4 w-4" };
  
  switch (status) {
    case "Новый запрос":
    case "Новый":
      return <FilePlus {...iconProps} />;
    
    case "Предварительная оценка":
    case "Ожидает подтверждения":
      return <ClipboardList {...iconProps} />;
    
    case "Согласование ТЗ/Дизайна":
    case "Согласование проекта":
      return <FileCheck {...iconProps} />;
    
    case "Ожидает замера":
    case "Ожидает оплаты":
    case "Ожидает предоплаты":
      return <Clock {...iconProps} />;
    
    case "Замер выполнен":
    case "Оплачен":
      return <CheckCircle {...iconProps} />;
    
    case "Проектирование":
      return <Compass {...iconProps} />;
    
    case "В производстве":
    case "Передан на сборку":
      return <Wrench {...iconProps} />;
    
    case "Готов к монтажу":
    case "Готов к отгрузке":
      return <Package {...iconProps} />;
    
    case "Монтаж":
    case "В доставке":
      return <Truck {...iconProps} />;
    
    case "Завершен":
    case "Выполнен":
      return <CheckCircle {...iconProps} />;
    
    case "Отменен":
      return <XCircle {...iconProps} />;
    
    default:
      return <FilePlus {...iconProps} />;
  }
};

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
        textClass = "text-gray-800";
        break;
      
      // Planning stages (light green with dark text)
      case "Предварительная оценка":
      case "Согласование ТЗ/Дизайна":
        bgClass = "bg-emerald-50";
        textClass = "text-gray-800";
        break;
      
      // Preparation stages (green tones with dark text)
      case "Ожидает замера":
      case "Замер выполнен":
        bgClass = "bg-green-100";
        textClass = "text-gray-800";
        break;
      
      // Work stages (more saturated green with dark text)
      case "Проектирование":
      case "Согласование проекта":
      case "Ожидает предоплаты":
        bgClass = "bg-green-200";
        textClass = "text-gray-900";
        break;
      
      // Production stages (bright green with white text)
      case "В производстве":
      case "Готов к монтажу":
        bgClass = "bg-green-400";
        textClass = "text-white";
        break;
      
      // Completion stages (brand green with white text)
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
        textClass = "text-gray-800";
        break;
      
      // Planning stages (light blue-green with dark text)
      case "Ожидает подтверждения":
        bgClass = "bg-emerald-50";
        textClass = "text-gray-800";
        break;
      
      // Payment stages (green tones with dark text)
      case "Ожидает оплаты":
      case "Оплачен":
        bgClass = "bg-green-100";
        textClass = "text-gray-800";
        break;
      
      // Assembly stages (more saturated green with dark text)
      case "Передан на сборку":
        bgClass = "bg-green-200";
        textClass = "text-gray-900";
        break;
      
      // Delivery stages (bright green with white text)
      case "Готов к отгрузке":
      case "В доставке":
        bgClass = "bg-green-400";
        textClass = "text-white";
        break;
      
      // Completion stages (brand green with white text)
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 overflow-x-auto pb-6">
          {kanbanData.columns.map((column) => {
            const { bgClass, textClass } = getStatusColumnStyles(column.id, selectedOrderType);
            const statusIcon = getStatusIcon(column.id);
            const hasOrders = column.orderIds.length > 0;
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${bgClass} ${textClass} p-4 rounded-t-md`}>
                  <div className="flex items-center gap-2 mb-3">
                    {statusIcon}
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-white/30 text-current border-current/20 hover:bg-white/40 font-medium"
                  >
                    {column.orderIds.length} заказ(ов)
                  </Badge>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        flex-1 p-3 rounded-b-md
                        ${hasOrders ? "min-h-[200px]" : "min-h-[120px]"}
                        ${snapshot.isDraggingOver ? "bg-accent/50" : "bg-muted/30"}
                        transition-colors duration-200
                      `}
                      style={{ 
                        maxHeight: hasOrders ? "calc(100vh - 280px)" : "auto", 
                        overflowY: hasOrders ? "auto" : "visible" 
                      }}
                    >
                      {hasOrders ? (
                        column.orderIds.map((orderId, index) => {
                          const order = kanbanData.ordersMap[orderId];
                          return order ? (
                            <OrderCard 
                              key={order.id} 
                              order={order} 
                              index={index} 
                            />
                          ) : null;
                        })
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <CompactEmptyState
                            icon={Package}
                            title="Нет заказов"
                            description="В этом статусе пока нет заказов"
                          />
                        </div>
                      )}
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
          Обновление...
        </div>
      )}
    </div>
  );
};

export default OrdersKanbanBoard;
