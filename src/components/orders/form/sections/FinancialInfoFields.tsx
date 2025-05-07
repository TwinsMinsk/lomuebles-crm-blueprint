
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { OrderFormValues } from "../orderFormSchema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancialInfoFieldsProps {
  form: UseFormReturn<OrderFormValues>;
}

export const FinancialInfoFields: React.FC<FinancialInfoFieldsProps> = ({ form }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="finalAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Итоговая сумма заказа (€)</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ""} 
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} 
                type="number" 
                step="0.01"
                placeholder="Рассчитывается автоматически"
                readOnly
                className="bg-gray-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
    </div>
  );
};
