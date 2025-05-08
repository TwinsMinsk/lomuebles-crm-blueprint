
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "@/hooks/useSupplierForm";

interface SupplierBasicInfoFieldsProps {
  form: UseFormReturn<SupplierFormValues>;
}

const SupplierBasicInfoFields: React.FC<SupplierBasicInfoFieldsProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Основная информация</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="supplier_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название поставщика*</FormLabel>
              <FormControl>
                <Input placeholder="Введите название поставщика" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Категории товаров</FormLabel>
              <FormControl>
                <Input placeholder="Например: Мебель, Освещение, Ткани" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Веб-сайт</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default SupplierBasicInfoFields;
