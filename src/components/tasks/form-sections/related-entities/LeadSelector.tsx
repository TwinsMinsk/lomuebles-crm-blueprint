
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads } from "@/hooks/useLeads";

const LeadSelector: React.FC = () => {
  const { control } = useFormContext();
  const { leads = [] } = useLeads({
    page: 1,
    pageSize: 100,
    sortColumn: 'creation_date',
    sortDirection: 'desc'
  });

  return (
    <FormField
      control={control}
      name="related_lead_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Связанный лид</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
            value={field.value?.toString() || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите лид" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {leads && leads.length > 0 ? leads.map((lead) => (
                <SelectItem 
                  key={lead.lead_id} 
                  value={String(lead.lead_id || "unknown")}
                >
                  {lead.name || "Лид без имени"}
                </SelectItem>
              )) : (
                <SelectItem value="no-leads-available">Нет доступных лидов</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LeadSelector;
