
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRelatedOrdersData } from "@/hooks/tasks/useRelatedOrdersData";

const OrderSelector: React.FC = () => {
  const { control } = useFormContext();
  const { orders, isLoading } = useRelatedOrdersData();

  // Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <FormField
      control={control}
      name="related_deal_order_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Связанный заказ</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
            value={field.value?.toString() || "none"}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Загрузка..." : "Выберите заказ"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {!isLoading && safeOrders.length > 0 ? (
                safeOrders.map((order) => (
                  <SelectItem 
                    key={order.deal_order_id} 
                    value={String(order.deal_order_id)}
                  >
                    {order.order_number || `Заказ #${order.deal_order_id}`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-orders-available" disabled>
                  {isLoading ? "Загрузка..." : "Нет доступных заказов"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default OrderSelector;
