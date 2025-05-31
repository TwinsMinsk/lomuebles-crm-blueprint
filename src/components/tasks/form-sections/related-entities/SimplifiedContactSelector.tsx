
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SimplifiedContactSelectorProps {
  value?: number | null;
  onChange: (value: number | null) => void;
}

const SimplifiedContactSelector: React.FC<SimplifiedContactSelectorProps> = ({ value, onChange }) => {
  const { control } = useFormContext();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["simplified-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("contact_id, full_name, primary_phone")
        .order("full_name")
        .limit(50);

      if (error) throw error;
      return data.map(contact => ({
        id: contact.contact_id,
        label: `${contact.full_name} ${contact.primary_phone ? `(${contact.primary_phone})` : ""}`
      }));
    }
  });

  return (
    <FormField
      control={control}
      name="related_contact_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Связанный контакт</FormLabel>
          <FormControl>
            <Select
              value={value?.toString() || ""}
              onValueChange={(val) => onChange(val ? parseInt(val) : null)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите контакт" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без контакта</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id.toString()}>
                    {contact.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SimplifiedContactSelector;
