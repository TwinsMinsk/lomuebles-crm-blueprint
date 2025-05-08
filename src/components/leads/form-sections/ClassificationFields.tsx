
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { LeadFormData, leadSources, clientLanguages, leadStatuses } from "../schema/leadFormSchema";

interface ClassificationFieldsProps {
  form: UseFormReturn<LeadFormData>;
}

const ClassificationFields: React.FC<ClassificationFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="lead_source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Источник лида</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || "website"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите источник" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {leadSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client_language"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Язык клиента *</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || "ES"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите язык" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {clientLanguages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lead_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Статус лида</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || "new"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {leadStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ClassificationFields;
