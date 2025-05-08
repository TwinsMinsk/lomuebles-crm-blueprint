
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "@/hooks/useSupplierForm";

interface SupplierBusinessFieldsProps {
  form: UseFormReturn<SupplierFormValues>;
}

const SupplierBusinessFields: React.FC<SupplierBusinessFieldsProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Деловая информация</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Условия сотрудничества</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Опишите условия работы с поставщиком..."
                  className="min-h-[120px]" 
                  {...field}
                  value={field.value || ''} 
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

export default SupplierBusinessFields;
