
import React from "react";
import { useNavigate } from "react-router-dom";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernHeader } from "@/components/ui/modern-header";
import OrderForm from "@/components/orders/form/OrderForm";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/orders");
  };

  const breadcrumbs = [
    { label: "CRM", href: "/dashboard" },
    { label: "Заказы", href: "/orders" },
    { label: "Создание заказа" }
  ];

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <ModernHeader
        title="Создание заказа"
        description="Добавление нового заказа в систему"
        breadcrumbs={breadcrumbs}
        action={
          <Button 
            variant="outline" 
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к заказам
          </Button>
        }
      />

      <ModernCard variant="glass">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Новый заказ
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <OrderForm onSuccess={handleSuccess} />
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default NewOrderPage;
