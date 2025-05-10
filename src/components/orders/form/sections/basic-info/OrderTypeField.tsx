
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";

interface OrderTypeFieldProps {
  form: UseFormReturn<OrderFormValues>;
  orderTypes: string[];
  isLoading: boolean;
}

export const OrderTypeField: React.FC<OrderTypeFieldProps> = ({ 
  form, 
  orderTypes, 
  isLoading 
}) => {
  return (
    <FormField
      control={form.control}
      name="orderType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Тип заказа *</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип заказа" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {orderTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
