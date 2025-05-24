
import React from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useOrdersKanban } from "@/hooks/orders/useOrdersKanban";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";
import OrderCard from "./OrderCard";
import KanbanSkeleton from "@/components/ui/skeletons/KanbanSkeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="w-64">
            <div className="h-10 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        <KanbanSkeleton columns={5} cardsPerColumn={4} />
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
          {kanbanData.columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className="bg-muted p-2 rounded-t-md">
                <h3 className="font-medium text-sm">{column.title}</h3>
                <div className="text-xs text-muted-foreground">
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
          ))}
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
