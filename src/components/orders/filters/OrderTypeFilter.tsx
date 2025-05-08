
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFilterValues } from "../OrderFilters";

interface OrderTypeFilterProps {
  form: UseFormReturn<OrderFilterValues>;
  orderTypes: string[];
  isLoading: boolean;
  onOrderTypeChange: (value: string) => void;
}

export const OrderTypeFilter: React.FC<OrderTypeFilterProps> = ({ 
  form, 
  orderTypes, 
  isLoading,
  onOrderTypeChange 
}) => {
  return (
    <FormField
      control={form.control}
      name="orderType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Тип заказа</FormLabel>
          <Select
            onValueChange={(value) => onOrderTypeChange(value)}
            value={field.value || "all"}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              {orderTypes.map((type) => (
                <SelectItem key={type} value={type || "unknown-type"}>{type || "Неизвестный тип"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
