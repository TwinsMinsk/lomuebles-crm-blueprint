
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFilterValues } from "../OrderFilters";

interface StatusFilterProps {
  form: UseFormReturn<OrderFilterValues>;
  statuses: string[];
  isLoading: boolean;
  selectedOrderType: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ 
  form, 
  statuses, 
  isLoading, 
  selectedOrderType 
}) => {
  if (!selectedOrderType) return null;
  
  return (
    <FormField
      control={form.control}
      name="currentStatus"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Текущий статус</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={isLoading || !selectedOrderType}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">Все статусы</SelectItem>
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
