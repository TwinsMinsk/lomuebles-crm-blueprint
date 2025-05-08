
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/hooks/useProductForm";

interface ProductBasicInfoFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductBasicInfoFields: React.FC<ProductBasicInfoFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Основная информация</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="internal_product_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название товара*</FormLabel>
              <FormControl>
                <Input placeholder="Введите название товара" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="internal_sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Артикул (SKU)</FormLabel>
              <FormControl>
                <Input placeholder="Введите артикул товара" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Категория</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Столы">Столы</SelectItem>
                  <SelectItem value="Стулья">Стулья</SelectItem>
                  <SelectItem value="Кровати">Кровати</SelectItem>
                  <SelectItem value="Шкафы">Шкафы</SelectItem>
                  <SelectItem value="Диваны">Диваны</SelectItem>
                  <SelectItem value="Комоды">Комоды</SelectItem>
                  <SelectItem value="Другое">Другое</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="base_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Базовая цена (€)</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value ? parseFloat(value) : null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ProductBasicInfoFields;
