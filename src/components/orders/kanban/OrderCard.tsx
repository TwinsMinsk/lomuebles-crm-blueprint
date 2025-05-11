
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Order } from "@/types/order";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface OrderCardProps {
  order: Order;
  index: number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, index }) => {
  return (
    <Draggable draggableId={order.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2"
        >
          <Card 
            className={`
              shadow-sm
              ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""}
              hover:shadow-md transition-shadow
            `}
          >
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-medium">
                {order.order_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 pb-1">
              {order.order_name && (
                <p className="text-sm font-medium truncate">{order.order_name}</p>
              )}
              {order.contact_name && (
                <p className="text-xs text-muted-foreground truncate">
                  {order.contact_name}
                </p>
              )}
            </CardContent>
            <CardFooter className="p-3 pt-0 flex justify-between">
              <div className="text-xs">
                {order.assigned_user_name && (
                  <span className="bg-muted px-1 py-0.5 rounded text-muted-foreground truncate">
                    {order.assigned_user_name}
                  </span>
                )}
              </div>
              {order.final_amount !== null && (
                <div className="text-sm font-medium">
                  {formatCurrency(order.final_amount)}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default OrderCard;
