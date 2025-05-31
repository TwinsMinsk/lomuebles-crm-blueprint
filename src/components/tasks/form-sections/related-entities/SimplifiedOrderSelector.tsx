
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SimplifiedOrderSelectorProps {
  value?: number | null;
  onChange: (value: number | null) => void;
}

const SimplifiedOrderSelector: React.FC<SimplifiedOrderSelectorProps> = ({ value, onChange }) => {
  const { control } = useFormContext();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["simplified-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, order_name")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data.map(order => ({
        id: order.id,
        label: `${order.order_number} - ${order.order_name || "Без названия"}`
      }));
    }
  });

  return (
    <FormField
      control={control}
      name="related_order_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Связанный заказ</FormLabel>
          <FormControl>
            <Select
              value={value?.toString() || ""}
              onValueChange={(val) => onChange(val ? parseInt(val) : null)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите заказ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без заказа</SelectItem>
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.id.toString()}>
                    {order.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SimplifiedOrderSelector;
