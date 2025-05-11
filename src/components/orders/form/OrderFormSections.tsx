
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "./orderFormSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicOrderInfoFields } from "./sections/BasicOrderInfoFields";
import { SimplifiedRelatedEntities } from "./sections/SimplifiedRelatedEntities";
import { FinancialInfoFields } from "./sections/FinancialInfoFields";
import { AdditionalInfoFields } from "./sections/AdditionalInfoFields";
import { OrderItemsSection } from "./sections/OrderItemsSection";

interface OrderFormSectionsProps {
  form: UseFormReturn<OrderFormValues>;
  orderId?: number;
  orderType: string;
}

export const OrderFormSections: React.FC<OrderFormSectionsProps> = ({
  form,
  orderId,
  orderType
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Основные данные заказа</CardTitle>
          <CardDescription>Заполните основную информацию о заказе</CardDescription>
        </CardHeader>
        <CardContent>
          <BasicOrderInfoFields isEdit={!!orderId} form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Связанные сущности</CardTitle>
          <CardDescription>Укажите клиента и ответственного менеджера</CardDescription>
        </CardHeader>
        <CardContent>
          <SimplifiedRelatedEntities form={form} />
        </CardContent>
      </Card>
      
      {/* Add the Order Items section */}
      <OrderItemsSection form={form} orderId={orderId} />
      
      <Card>
        <CardHeader>
          <CardTitle>Финансовая информация</CardTitle>
          <CardDescription>Управление финансовыми данными заказа</CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialInfoFields form={form} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Дополнительная информация</CardTitle>
          <CardDescription>Адрес доставки, комментарии и файлы по заказу</CardDescription>
        </CardHeader>
        <CardContent>
          <AdditionalInfoFields form={form} />
        </CardContent>
      </Card>
    </>
  );
};
