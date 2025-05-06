
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ContactFormValues } from "../schema/contactFormSchema";

interface Company {
  company_id: number;
  company_name: string;
}

interface User {
  id: string;
  full_name: string;
}

interface ContactAdditionalFieldsProps {
  form: UseFormReturn<ContactFormValues>;
  companies: Company[];
  users: User[];
}

const ContactAdditionalFields: React.FC<ContactAdditionalFieldsProps> = ({ form, companies, users }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="associated_company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Связанная компания</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value?.toString() || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите компанию" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="null">Не выбрана (частное лицо)</SelectItem>
                {companies.map((company) => (
                  <SelectItem
                    key={company.company_id}
                    value={company.company_id.toString()}
                  >
                    {company.company_name}
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
        name="owner_user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ответственный менеджер</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="null">Не назначен</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
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
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Заметки</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Общие заметки о контакте..."
                className="min-h-32"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Note: File upload functionality would be added here in future implementation */}
      <div className="bg-muted/50 p-4 rounded-md">
        <p className="text-sm text-muted-foreground">
          Функционал загрузки файлов будет доступен в будущих версиях.
        </p>
      </div>
    </>
  );
};

export default ContactAdditionalFields;
