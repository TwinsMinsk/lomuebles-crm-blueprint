
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderById } from "@/hooks/orders/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderForm from "@/components/orders/form/OrderForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderById(id ? Number(id) : undefined);

  const handleSuccess = () => {
    navigate("/orders");
  };

  const handleBack = () => {
    navigate("/orders");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-red-500">Ошибка загрузки данных: {error.message}</p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к списку заказов
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-amber-500">Заказ не найден</p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к списку заказов
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Редактирование заказа #{order.order_number}
        </h1>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к списку
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {order.order_name || `Заказ #${order.order_number}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm order={order} onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;
