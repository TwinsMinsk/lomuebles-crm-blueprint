
import React from "react";
import PageHeader from "@/components/common/PageHeader";
import OrdersContent from "./OrdersContent";
import { KanbanSquare, Package, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAddOrder = () => {
    navigate("/orders/new");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Заказы"
        description="Управление заказами клиентов"
        action={
          <Button onClick={handleAddOrder} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Добавить заказ
          </Button>
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
