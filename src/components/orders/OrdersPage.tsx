
import React from "react";
import PageHeader from "@/components/common/PageHeader";
import OrdersContent from "./OrdersContent";
import { KanbanSquare, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const OrdersPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Заказы"
        description="Управление заказами клиентов"
        action={
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
        }
      />
      
      <Card>
        <CardContent className="p-6">
          <OrdersContent />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
