
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";

interface ClientLanguageFieldProps {
  form: UseFormReturn<OrderFormValues>;
}

export const ClientLanguageField: React.FC<ClientLanguageFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="clientLanguage"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Язык клиента *</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите язык" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="ES">Испанский (ES)</SelectItem>
              <SelectItem value="EN">Английский (EN)</SelectItem>
              <SelectItem value="RU">Русский (RU)</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
