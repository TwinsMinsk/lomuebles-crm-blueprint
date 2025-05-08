
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContacts } from "@/hooks/useContacts";

const ContactSelector: React.FC = () => {
  const { control } = useFormContext();
  const { contacts = [] } = useContacts({
    page: 1,
    pageSize: 100,
    sortColumn: 'creation_date',
    sortDirection: 'desc'
  });

  return (
    <FormField
      control={control}
      name="related_contact_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Связанный контакт</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
            value={field.value?.toString() || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите контакт" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {contacts && contacts.length > 0 ? contacts.map((contact) => (
                <SelectItem 
                  key={contact.contact_id} 
                  value={String(contact.contact_id)}
                >
                  {contact.full_name || `Контакт #${contact.contact_id}`}
                </SelectItem>
              )) : (
                <SelectItem value="no-contacts-available">Нет доступных контактов</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ContactSelector;
