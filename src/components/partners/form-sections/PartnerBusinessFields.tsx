
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/usePartnerForm";

interface PartnerBusinessFieldsProps {
  form: UseFormReturn<PartnerFormValues>;
}

const PartnerBusinessFields: React.FC<PartnerBusinessFieldsProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Условия сотрудничества и дополнительная информация</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Условия сотрудничества</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Опишите условия работы с партнером..."
                  className="min-h-[120px]" 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requisites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Реквизиты</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Банковские и юридические реквизиты..."
                  className="min-h-[80px]" 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Заметки</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Дополнительные заметки..."
                  className="min-h-[80px]" 
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

export default PartnerBusinessFields;
