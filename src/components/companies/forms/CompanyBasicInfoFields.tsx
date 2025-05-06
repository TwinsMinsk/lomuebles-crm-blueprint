
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CompanyFormValues } from "./CompanyFormSchema";

interface CompanyBasicInfoFieldsProps {
  form: UseFormReturn<CompanyFormValues>;
}

const CompanyBasicInfoFields: React.FC<CompanyBasicInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Название компании *</FormLabel>
            <FormControl>
              <Input placeholder="Введите название компании" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nif_cif"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NIF/CIF</FormLabel>
            <FormControl>
              <Input placeholder="Введите NIF/CIF" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CompanyBasicInfoFields;
