
import React, { useState } from "react";
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

interface SimplifiedEntitySelectorProps {
  form: UseFormReturn<OrderFormValues>;
  fieldName: keyof OrderFormValues;
  label: string;
  options: EntityOption[];
  placeholder: string;
  emptyMessage: string;
  isLoading: boolean;
  required?: boolean;
}

const SimplifiedEntitySelector = ({
  form,
  fieldName,
  label,
  options,
  placeholder,
  emptyMessage,
  isLoading,
  required = false
}: SimplifiedEntitySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get the current value from form
  const currentValue = form.watch(fieldName);
  
  // Ensure options is ALWAYS an array even if undefined or null is passed
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Filter options based on search query - add defensive checks
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) {
      return safeOptions;
    }
    
    return safeOptions.filter(option => {
      if (!option || typeof option.name !== 'string') return false;
      return option.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [safeOptions, searchQuery]);

  // Find the selected option - with defensive checks
  const selectedOption = React.useMemo(() => {
    if (!currentValue || safeOptions.length === 0) return undefined;
    return safeOptions.find(option => option && option.id === currentValue);
  }, [safeOptions, currentValue]);

  // Add a display label with required indicator
  const displayLabel = required ? `${label} *` : label;

  return (
    <FormField
      control={form.control}
      name={fieldName as any}
      render={({ field: formField }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{displayLabel}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between w-full",
                    !formField.value && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                  onClick={() => setOpen(!open)}
                  type="button"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Загрузка...</span>
                    </div>
                  ) : formField.value ? (
                    selectedOption?.name || placeholder
                  ) : (
                    placeholder
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 max-h-[300px] overflow-auto" align="start">
              {isLoading ? (
                <div className="py-6 text-center">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">Загрузка данных...</span>
                </div>
              ) : (
                <Command>
                  <CommandInput 
                    placeholder={`Поиск ${placeholder.toLowerCase()}...`} 
                    onValueChange={setSearchQuery}
                    value={searchQuery}
                    className="h-9"
                  />
                  {/* Fixed: Check if options array is empty */}
                  {safeOptions.length === 0 ? (
                    <div className="py-6 text-center text-sm">
                      {emptyMessage}
                    </div>
                  ) : (
                    <>
                      <CommandEmpty className="py-3 text-center text-sm">Ничего не найдено</CommandEmpty>
                      <CommandGroup>
                        {!required && (
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              form.setValue(fieldName as any, null);
                              setSearchQuery("");
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formField.value === null ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Не выбрано
                          </CommandItem>
                        )}
                        {/* Fixed: Use filteredOptions which is guaranteed to be array */}
                        {filteredOptions.map((option) => (
                          <CommandItem
                            key={String(option?.id || Math.random())}
                            value={String(option?.name || '')}
                            onSelect={() => {
                              if (option?.id !== undefined) {
                                form.setValue(fieldName as any, option.id);
                              }
                              setSearchQuery("");
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                option?.id === formField.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option?.name || `#${option?.id || 'unknown'}`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </Command>
              )}
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SimplifiedEntitySelector;
