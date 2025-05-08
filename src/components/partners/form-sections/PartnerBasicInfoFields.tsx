
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/usePartnerForm";

interface PartnerBasicInfoFieldsProps {
  form: UseFormReturn<PartnerFormValues>;
}

const PartnerBasicInfoFields: React.FC<PartnerBasicInfoFieldsProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Основная информация</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название компании*</FormLabel>
              <FormControl>
                <Input placeholder="Введите название компании" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Специализация</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Например: изготовление шкафов, дверей..." 
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

export default PartnerBasicInfoFields;
