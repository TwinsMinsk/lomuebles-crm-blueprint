
import React from "react";
import PageHeader from "@/components/common/PageHeader";
import OrdersContent from "./OrdersContent";
import { Package } from "lucide-react";

const OrdersPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Заказы"
        description="Управление заказами клиентов"
        icon={<Package className="w-6 h-6" />}
      />
      
      <OrdersContent />
    </div>
  );
};

export default OrdersPage;
