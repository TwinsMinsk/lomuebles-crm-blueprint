
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRelatedOrdersData } from "@/hooks/tasks/useRelatedOrdersData";

const OrderSelector: React.FC = () => {
  const { control } = useFormContext();
  const { orders } = useRelatedOrdersData();

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
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите заказ" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {orders && orders.length > 0 ? orders.map((order) => (
                <SelectItem 
                  key={order.deal_order_id} 
                  value={String(order.deal_order_id || "unknown")}
                >
                  {order.order_number || "Заказ без номера"}
                </SelectItem>
              )) : (
                <SelectItem value="no-orders">Нет доступных заказов</SelectItem>
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
