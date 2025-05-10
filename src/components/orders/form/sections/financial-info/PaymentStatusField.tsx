
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderFormValues } from "../../orderFormSchema";

interface PaymentStatusFieldProps {
  form: UseFormReturn<OrderFormValues>;
}

export const PaymentStatusField: React.FC<PaymentStatusFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="paymentStatus"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Статус оплаты</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value || undefined}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус оплаты" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Не оплачен">Не оплачен</SelectItem>
              <SelectItem value="Частично оплачен">Частично оплачен</SelectItem>
              <SelectItem value="Оплачен полностью">Оплачен полностью</SelectItem>
              <SelectItem value="Возврат">Возврат</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
