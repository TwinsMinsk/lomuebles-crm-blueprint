
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CompanyFormValues } from "./CompanyFormSchema";

interface CompanyNotesFieldProps {
  form: UseFormReturn<CompanyFormValues>;
}

const CompanyNotesField: React.FC<CompanyNotesFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Заметки</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Дополнительная информация о компании"
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompanyNotesField;
