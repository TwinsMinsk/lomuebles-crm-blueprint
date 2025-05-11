
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderFormValues } from "../../orderFormSchema";
import { Loader2 } from "lucide-react";

export interface EntityOption {
  id: number | string;
  name: string;
}

interface SimpleEntitySelectProps {
  form: UseFormReturn<OrderFormValues>;
  fieldName: keyof OrderFormValues;
  label: string;
  options: EntityOption[];
  placeholder: string;
  emptyMessage: string;
  isLoading: boolean;
  required?: boolean;
}

const SimpleEntitySelect = ({
  form,
  fieldName,
  label,
  options,
  placeholder,
  emptyMessage,
  isLoading,
  required = false
}: SimpleEntitySelectProps) => {
  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Get the current value from form
  const currentValue = form.watch(fieldName);

  // Add debug log for current state
  console.log(`SimpleEntitySelect for ${fieldName}:`, {
    optionsCount: safeOptions.length, 
    currentValue
  });

  // Display label with required indicator if needed
  const displayLabel = required ? `${label} *` : label;

  return (
    <FormField
      control={form.control}
      name={fieldName as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{displayLabel}</FormLabel>
          <Select
            onValueChange={(value) => {
              // Handle "none" specially to set null
              if (value === "none") {
                form.setValue(fieldName as any, null);
              } else {
                // For other values, try to parse as number if it looks numeric
                const parsedValue = /^\d+$/.test(value) ? parseInt(value, 10) : value;
                form.setValue(fieldName as any, parsedValue);
              }
            }}
            value={currentValue?.toString() || "none"}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Загрузка...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={placeholder} />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {/* Add "None" option for non-required fields */}
              {!required && (
                <SelectItem value="none">Не выбрано</SelectItem>
              )}
              
              {/* Display options */}
              {safeOptions.length === 0 ? (
                <SelectItem value="no-options" disabled>
                  {emptyMessage}
                </SelectItem>
              ) : (
                safeOptions.map((option) => (
                  <SelectItem 
                    key={`option-${String(option?.id || Math.random())}`}
                    value={String(option?.id || '')}
                  >
                    {option?.name || `#${option?.id || 'unknown'}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SimpleEntitySelect;
