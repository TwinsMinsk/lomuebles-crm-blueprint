
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/hooks/useOrders";
import { DraggableProvided } from "@hello-pangea/dnd";

interface OrderCardProps {
  order: Order;
  provided: DraggableProvided;
  isDragging: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, provided, isDragging }) => {
  // Format currency for display
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Не указано";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="rounded-md"
    >
      <Card className={`mb-2 ${
        isDragging ? "ring-2 ring-primary" : ""
      }`}>
        <CardContent className="p-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {order.order_number}
          </div>
          <div className="text-sm font-semibold mb-2 line-clamp-2">
            {order.order_name || "Без названия"}
          </div>
          <div className="text-xs mb-2">
            <span className="font-medium">Клиент:</span>{" "}
            {order.contact_name}
          </div>
          {order.company_name && (
            <div className="text-xs mb-2">
              <span className="font-medium">Компания:</span>{" "}
              {order.company_name}
            </div>
          )}
          <div className="text-xs mb-1">
            <span className="font-medium">Менеджер:</span>{" "}
            {order.manager_name}
          </div>
          {order.payment_status && (
            <div className="text-xs mb-1">
              <span className="font-medium">Статус оплаты:</span>{" "}
              {order.payment_status}
            </div>
          )}
          <div className="text-sm font-bold mt-2">
            {formatCurrency(order.final_amount)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderCard;
