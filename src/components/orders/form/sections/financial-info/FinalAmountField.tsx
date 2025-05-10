
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OrderFormValues } from "../../orderFormSchema";
import { formatCurrency } from "@/utils/formatters";

interface FinalAmountFieldProps {
  form: UseFormReturn<OrderFormValues>;
}

export const FinalAmountField: React.FC<FinalAmountFieldProps> = ({ form }) => {
  // Get current value to display formatted
  const finalAmount = form.watch("finalAmount");
  
  return (
    <FormField
      control={form.control}
      name="finalAmount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Итоговая сумма заказа (€)</FormLabel>
          <FormControl>
            <Input 
              value={finalAmount ? formatCurrency(finalAmount).replace('€', '') : ""} 
              type="text"
              placeholder="Рассчитывается автоматически"
              readOnly
              className="bg-gray-100"
              disabled
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
