
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get the current value from form
  const currentValue = form.watch(fieldName);
  
  // Ensure options is always a valid array
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Filter options based on search query if needed
  const filteredOptions = searchQuery 
    ? safeOptions.filter(option => 
        option.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeOptions;

  // Find the selected option
  const selectedOption = safeOptions.find(option => option.id === currentValue);

  return (
    <FormField
      control={form.control}
      name={fieldName as any}
      render={({ field: formField }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <TooltipProvider>
            <Tooltip>
              <Popover open={open} onOpenChange={setOpen}>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isLoading ? "Загрузка данных..." : 
                   safeOptions.length === 0 ? "Нет доступных данных" : 
                   `Нажмите для выбора ${label.toLowerCase()}`}
                </TooltipContent>
                <PopoverContent className="w-[300px] p-0 max-h-[300px] overflow-auto">
                  <Command>
                    <CommandInput 
                      placeholder={`Поиск ${placeholder.toLowerCase()}...`} 
                      onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                    {filteredOptions.length > 0 ? (
                      <CommandGroup>
                        {filteredOptions.map((option) => (
                          <CommandItem
                            key={String(option.id)}
                            value={String(option.name)}
                            onSelect={() => {
                              form.setValue(fieldName as any, option.id);
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
                            {option.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <CommandEmpty>{emptyMessage}</CommandEmpty>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            </Tooltip>
          </TooltipProvider>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EntitySelector;
