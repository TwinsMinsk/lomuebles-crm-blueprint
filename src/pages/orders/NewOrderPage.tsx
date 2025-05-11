
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderForm from "@/components/orders/form/OrderForm";

const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/orders");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tight">Создание заказа</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новый заказ</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewOrderPage;
