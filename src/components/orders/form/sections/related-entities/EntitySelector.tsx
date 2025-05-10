
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";

export interface EntityOption {
  id: number | string;
  name: string;
}

interface EntitySelectorProps {
  form: UseFormReturn<OrderFormValues>;
  fieldName: keyof OrderFormValues;
  label: string;
  options: EntityOption[];
  placeholder: string;
  emptyMessage: string;
  isLoading: boolean;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
  form,
  fieldName,
  label,
  options = [], // Default to empty array
  placeholder,
  emptyMessage,
  isLoading
}) => {
  const field = form.watch(fieldName);
  
  // Ensure options is always a valid array
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <FormField
      control={form.control}
      name={fieldName as any}
      render={({ field: formField }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !formField.value && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : formField.value ? (
                    safeOptions.find((option) => option.id === formField.value)?.name || placeholder
                  ) : (
                    placeholder
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder={`Поиск ${placeholder.toLowerCase()}...`} />
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {safeOptions.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={() => {
                        form.setValue(fieldName as any, option.id);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          option.id === formField.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EntitySelector;
