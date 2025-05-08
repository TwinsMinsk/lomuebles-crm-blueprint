
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFilterValues } from "../OrderFilters";

interface PaymentStatusFilterProps {
  form: UseFormReturn<OrderFilterValues>;
  paymentStatuses: string[];
  isLoading: boolean;
}

export const PaymentStatusFilter: React.FC<PaymentStatusFilterProps> = ({ 
  form, 
  paymentStatuses, 
  isLoading 
}) => {
  return (
    <FormField
      control={form.control}
      name="paymentStatus"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Статус оплаты</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || "all"}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Все статусы оплаты" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="all">Все статусы оплаты</SelectItem>
              {paymentStatuses.map((status) => (
                <SelectItem key={status} value={status || "unknown-status"}>{status || "Неизвестный статус"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
