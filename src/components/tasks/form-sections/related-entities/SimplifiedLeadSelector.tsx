
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SimplifiedLeadSelector: React.FC = () => {
  const { control } = useFormContext();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["simplified-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("lead_id, name, phone")
        .order("creation_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data.map(lead => ({
        id: lead.lead_id,
        label: `${lead.name || "Лид без имени"} ${lead.phone ? `(${lead.phone})` : ""}`
      }));
    }
  });

  return (
    <FormField
      control={control}
      name="related_lead_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Связанный лид</FormLabel>
          <FormControl>
            <Select
              value={field.value?.toString() || ""}
              onValueChange={(val) => field.onChange(val ? parseInt(val) : null)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите лид" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без лида</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id.toString()}>
                    {lead.label}
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

export default SimplifiedLeadSelector;
