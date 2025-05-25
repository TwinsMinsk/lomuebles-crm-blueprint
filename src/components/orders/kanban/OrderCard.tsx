
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Order } from "@/types/order";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatters";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import OrderViewPopup from "@/components/orders/OrderViewPopup";

interface OrderCardProps {
  order: Order;
  index: number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, index }) => {
  return (
    <Dialog>
      <Draggable draggableId={order.id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-2"
          >
            <DialogTrigger asChild>
              <Card 
                className={`
                  shadow-md cursor-pointer border-l-4 border-l-accent-green transition-all duration-200
                  ${snapshot.isDragging ? "shadow-lg ring-2 ring-accent-green" : ""}
                  hover:shadow-lg hover:border-[#8bd60e] hover:-translate-y-0.5
                `}
              >
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {order.order_number}
                  </CardTitle>
                </CardHeader>
                
                {order.order_name && (
                  <>
                    <Separator className="mx-3" />
                    <CardContent className="p-3 pt-2 pb-1">
                      <p className="text-sm font-medium truncate">{order.order_name}</p>
                    </CardContent>
                  </>
                )}
                
                {order.contact && (
                  <>
                    <Separator className="mx-3" />
                    <CardContent className="p-3 pt-2 pb-1">
                      <p className="text-xs text-muted-foreground truncate">
                        {order.contact.full_name}
                      </p>
                    </CardContent>
                  </>
                )}
                
                <Separator className="mx-3" />
                <CardFooter className="p-3 pt-2 flex justify-between items-center">
                  <div className="text-xs flex-1 min-w-0">
                    {order.assigned_user && (
                      <span className="bg-muted px-2 py-1 rounded text-muted-foreground truncate inline-block max-w-full">
                        {order.assigned_user.full_name}
                      </span>
                    )}
                  </div>
                  {order.final_amount !== null && (
                    <div className="text-sm font-medium text-green-600 ml-2 flex-shrink-0">
                      {formatCurrency(order.final_amount)}
                    </div>
                  )}
                </CardFooter>
              </Card>
            </DialogTrigger>
          </div>
        )}
      </Draggable>
      <DialogContent className="sm:max-w-[650px]">
        <OrderViewPopup orderId={order.id} />
      </DialogContent>
    </Dialog>
  );
};

export default OrderCard;
