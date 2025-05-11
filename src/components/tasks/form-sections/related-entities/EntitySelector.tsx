
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "../../schema/taskFormSchema";

export interface EntityOption {
  id: number | string;
  name: string;
}

interface EntitySelectorProps {
  form: UseFormReturn<TaskFormValues>;
  fieldName: keyof TaskFormValues;
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
  options = [],
  placeholder,
  emptyMessage,
  isLoading
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get the current value from form
  const currentValue = form.watch(fieldName);
  
  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return safeOptions;
    return safeOptions.filter(option => {
      // Safely check if name exists and has toLowerCase method
      if (!option.name) return false;
      return option.name.toLowerCase?.().includes(searchQuery.toLowerCase());
    });
  }, [safeOptions, searchQuery]);

  // Find the selected option
  const selectedOption = React.useMemo(() => 
    safeOptions.find(option => option.id === currentValue),
    [safeOptions, currentValue]
  );

  return (
    <FormField
      control={form.control}
      name={fieldName as any}
      render={({ field: formField }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
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
              ) : safeOptions.length > 0 ? (
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder={`Поиск ${placeholder.toLowerCase()}...`} 
                    onValueChange={setSearchQuery}
                    value={searchQuery}
                    className="h-9"
                  />
                  {filteredOptions.length === 0 ? (
                    <CommandEmpty>
                      <div className="py-6 text-center text-sm">
                        Ничего не найдено
                      </div>
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
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
                            formField.value === null
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Не выбрано
                      </CommandItem>
                      {filteredOptions.map((option) => (
                        <CommandItem
                          key={String(option.id)}
                          value={String(option.name || '')}
                          onSelect={() => {
                            form.setValue(fieldName as any, option.id);
                            setSearchQuery("");
                            setOpen(false);
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
                          {option.name || `#${option.id}`}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              ) : (
                <div className="py-6 text-center text-sm">
                  {emptyMessage}
                </div>
              )}
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EntitySelector;
