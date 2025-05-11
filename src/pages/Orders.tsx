
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/hooks/orders/useOrders";
import { Loader2 } from "lucide-react";

const Orders: React.FC = () => {
  const { user } = useAuth();
  const { data: orders, isLoading, error } = useOrders();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Заказы</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Раздел Заказы</CardTitle>
          <CardDescription>
            {isLoading ? "Загрузка данных..." : `Найдено заказов: ${orders?.length || 0}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-10">
              <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
              <p className="mt-2 text-gray-500">Загрузка заказов...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <p className="mb-4 text-red-500">
                Ошибка загрузки заказов: {(error as Error).message}
              </p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <p className="mb-4 text-muted-foreground">
                В системе пока нет заказов. Скоро здесь появится интерфейс для работы с заказами.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg">
                База для заказов успешно подключена. Разрабатываем полноценный интерфейс для работы с заказами.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Заказы загружены из базы данных и готовы к работе.
              </p>
            </div>
          )}
          
          {user?.email && (
            <p className="mt-6 text-sm text-muted-foreground text-center">
              Вы вошли как: {user.email}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
