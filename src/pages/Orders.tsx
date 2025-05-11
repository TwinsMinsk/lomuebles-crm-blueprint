
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const Orders: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Заказы</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Раздел в разработке</CardTitle>
          <CardDescription>
            Функциональность заказов находится в процессе редизайна и будет доступна в ближайшее время.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <p className="mb-4 text-muted-foreground">
              База данных для заказов уже подготовлена. Мы работаем над новым, улучшенным интерфейсом для работы с заказами.
            </p>
            {user?.email && (
              <p className="text-sm text-muted-foreground">
                Вы вошли как: {user.email}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
