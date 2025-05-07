
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OrderFilterValues } from "../OrderFilters";

interface SearchFilterProps {
  form: UseFormReturn<OrderFilterValues>;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="search"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Поиск</FormLabel>
          <FormControl>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Номер, название, клиент или компания..." 
                className="pl-8" 
                {...field} 
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
