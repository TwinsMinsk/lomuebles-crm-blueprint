
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "@/hooks/useSupplierForm";

interface SupplierContactFieldsProps {
  form: UseFormReturn<SupplierFormValues>;
}

const SupplierContactFields: React.FC<SupplierContactFieldsProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Контактная информация</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="contact_person"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Контактное лицо</FormLabel>
              <FormControl>
                <Input placeholder="Имя контактного лица" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl>
                <Input placeholder="+34 XXX XXX XXX" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default SupplierContactFields;
