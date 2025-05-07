import React, { useState, useEffect } from "react";
import { 
  Form, 
  FormField,
  FormItem, 
  FormLabel,
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";

// Define the filter form schema
const orderFilterSchema = z.object({
  search: z.string().optional(),
  orderType: z.string().optional(),
  currentStatus: z.string().optional(),
  assignedUserId: z.string().optional(),
  paymentStatus: z.string().optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
});

type OrderFilterValues = z.infer<typeof orderFilterSchema>;

interface OrderFiltersProps {
  onApplyFilters: (filters: OrderFilterValues) => void;
  onResetFilters: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ 
  onApplyFilters, 
  onResetFilters 
}) => {
  const { 
    orderTypes, 
    readyMadeStatuses, 
    customMadeStatuses, 
    paymentStatuses, 
    managers,
    isLoading 
  } = useFilterOptions();

  const [selectedOrderType, setSelectedOrderType] = useState<string>("");

  const form = useForm<OrderFilterValues>({
    resolver: zodResolver(orderFilterSchema),
    defaultValues: {
      search: "",
      orderType: "",
      currentStatus: "",
      assignedUserId: "",
      paymentStatus: "",
    }
  });

  // Reset current status when order type changes
  useEffect(() => {
    form.setValue("currentStatus", "");
  }, [selectedOrderType, form]);

  // Get available statuses based on selected order type
  const getAvailableStatuses = () => {
    if (!selectedOrderType) return [];
    if (selectedOrderType === "Готовая мебель (Tilda)") return readyMadeStatuses;
    if (selectedOrderType === "Мебель на заказ") return customMadeStatuses;
    return [];
  };

  const handleApplyFilters = (data: OrderFilterValues) => {
    onApplyFilters(data);
  };

  const handleResetFilters = () => {
    form.reset({
      search: "",
      orderType: "",
      currentStatus: "",
      assignedUserId: "",
      paymentStatus: "",
      fromDate: undefined,
      toDate: undefined,
    });
    setSelectedOrderType("");
    onResetFilters();
  };

  const handleOrderTypeChange = (value: string) => {
    setSelectedOrderType(value);
    form.setValue("orderType", value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleApplyFilters)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search field */}
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Поиск</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Номер, название, клиент или компания..." 
                      className="pl-8" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Order Type filter */}
          <FormField
            control={form.control}
            name="orderType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип заказа</FormLabel>
                <Select
                  onValueChange={(value) => handleOrderTypeChange(value)}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Все типы</SelectItem>
                    {orderTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current Status filter - only show if order type is selected */}
          {selectedOrderType && (
            <FormField
              control={form.control}
              name="currentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Текущий статус</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || !selectedOrderType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Все статусы" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Все статусы</SelectItem>
                      {getAvailableStatuses().map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Assigned Manager filter */}
          <FormField
            control={form.control}
            name="assignedUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ответственный менеджер</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Все менеджеры" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Все менеджеры</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Status filter */}
          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Статус оплаты</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Все статусы оплаты" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Все статусы оплаты</SelectItem>
                    {paymentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* From Date filter */}
          <FormField
            control={form.control}
            name="fromDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата создания от</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd.MM.yyyy")
                        ) : (
                          <span>Выберите дату</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* To Date filter */}
          <FormField
            control={form.control}
            name="toDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата создания до</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd.MM.yyyy")
                        ) : (
                          <span>Выберите дату</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleResetFilters}
          >
            Сбросить фильтры
          </Button>
          <Button type="submit">
            Применить фильтры
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrderFilters;
