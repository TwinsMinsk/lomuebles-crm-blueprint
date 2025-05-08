
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomRequests } from "@/hooks/useCustomRequests";

const CustomRequestSelector: React.FC = () => {
  const { control } = useFormContext();
  const { customRequests = [] } = useCustomRequests();

  return (
    <FormField
      control={control}
      name="related_custom_request_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Связанный запрос</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
            value={field.value?.toString() || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите запрос" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {customRequests && customRequests.length > 0 ? customRequests.map((request) => (
                <SelectItem 
                  key={request.custom_request_id} 
                  value={String(request.custom_request_id || "unknown")}
                >
                  {request.request_name || "Запрос без названия"}
                </SelectItem>
              )) : (
                <SelectItem value="no-requests-available">Нет доступных запросов</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomRequestSelector;
