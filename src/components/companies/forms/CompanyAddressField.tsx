
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CompanyFormValues } from "./CompanyFormSchema";

interface CompanyAddressFieldProps {
  form: UseFormReturn<CompanyFormValues>;
}

const CompanyAddressField: React.FC<CompanyAddressFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Адрес</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Введите полный адрес"
              className="min-h-[80px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompanyAddressField;
