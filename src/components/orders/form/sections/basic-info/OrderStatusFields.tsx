
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";

interface OrderStatusFieldProps {
  form: UseFormReturn<OrderFormValues>;
  statuses: string[];
  isLoading: boolean;
  fieldName: "statusReadyMade" | "statusCustomMade";
}

export const OrderStatusField: React.FC<OrderStatusFieldProps> = ({ 
  form, 
  statuses, 
  isLoading,
  fieldName 
}) => {
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Статус заказа</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
