
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePartners } from "@/hooks/usePartners";

const PartnerSelector: React.FC = () => {
  const { control } = useFormContext();
  const { partners = [] } = usePartners();

  return (
    <FormField
      control={control}
      name="related_partner_manufacturer_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Связанный партнер</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
            value={field.value?.toString() || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите партнера" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {partners && partners.length > 0 ? partners.map((partner) => (
                <SelectItem 
                  key={partner.partner_manufacturer_id} 
                  value={String(partner.partner_manufacturer_id)}
                >
                  {partner.company_name || `Партнер #${partner.partner_manufacturer_id}`}
                </SelectItem>
              )) : (
                <SelectItem value="no-partners-available">Нет доступных партнеров</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PartnerSelector;
