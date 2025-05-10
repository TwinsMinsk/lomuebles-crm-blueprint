
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";

interface OrderNumberFieldProps {
  form: UseFormReturn<OrderFormValues>;
}

export const OrderNumberField: React.FC<OrderNumberFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="orderNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Номер заказа</FormLabel>
          <FormControl>
            <Input
              placeholder="Генерируется автоматически"
              {...field}
              value={field.value || ""}
              disabled={true}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface OrderNameFieldProps {
  form: UseFormReturn<OrderFormValues>;
}

export const OrderNameField: React.FC<OrderNameFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="orderName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Название заказа</FormLabel>
          <FormControl>
            <Input
              placeholder="Введите название заказа"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
