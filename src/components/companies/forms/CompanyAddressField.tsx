
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CompanyFormValues } from "./CompanyFormSchema";

interface CompanyAddressFieldProps {
  form: UseFormReturn<CompanyFormValues>;
}

/**
 * CompanyAddressField provides a textarea for entering company address information
 * with appropriate validation and helpful description.
 */
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
              placeholder="Введите полный адрес компании"
              className="min-h-[80px] resize-y"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Укажите полный адрес офиса или основного места деятельности компании
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompanyAddressField;
