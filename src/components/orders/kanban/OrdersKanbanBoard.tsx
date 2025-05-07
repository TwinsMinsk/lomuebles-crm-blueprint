
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { useOrdersKanban } from "@/hooks/orders/useOrdersKanban";
import OrderCard from "./OrderCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw } from "lucide-react";

const OrdersKanbanBoard: React.FC = () => {
  const {
    columns,
    orders,
    orderTypes,
    isLoading,
    currentOrderType,
    setCurrentOrderType,
    handleDragEnd,
    refreshData,
  } = useOrdersKanban();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="space-x-2 flex items-center">
          <span className="text-sm font-medium">Тип заказа:</span>
          <Select
            value={currentOrderType}
            onValueChange={setCurrentOrderType}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Выберите тип заказа" />
            </SelectTrigger>
            <SelectContent>
              {orderTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> 
            Обновить
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-6 overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-fit">
            {Object.entries(columns).map(([columnId, column]) => (
              <div key={columnId} className="w-72 flex-shrink-0">
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 rounded-lg border min-h-[500px] ${
                        snapshot.isDraggingOver ? "bg-muted/50" : "bg-card"
                      }`}
                    >
                      <h3 className="font-medium text-sm mb-3 pb-2 border-b sticky top-0 bg-inherit">
                        {column.title}{" "}
                        <span className="text-muted-foreground ml-1">
                          ({column.items.length})
                        </span>
                      </h3>
                      
                      <div className="space-y-3">
                        {column.items.map((order, index) => (
                          <Draggable
                            key={order.deal_order_id.toString()}
                            draggableId={order.deal_order_id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <OrderCard
                                order={order}
                                provided={provided}
                                isDragging={snapshot.isDragging}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default OrdersKanbanBoard;
