
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFilterValues } from "../OrderFilters";

interface Manager {
  id: string;
  name: string;
}

interface ManagerFilterProps {
  form: UseFormReturn<OrderFilterValues>;
  managers: Manager[];
  isLoading: boolean;
}

export const ManagerFilter: React.FC<ManagerFilterProps> = ({ form, managers, isLoading }) => {
  return (
    <FormField
      control={form.control}
      name="assignedUserId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ответственный менеджер</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Все менеджеры" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">Все менеджеры</SelectItem>
              {managers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
