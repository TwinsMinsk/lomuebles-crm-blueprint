
import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";

// Import the new filter components
import { SearchFilter } from "./filters/SearchFilter";
import { OrderTypeFilter } from "./filters/OrderTypeFilter";
import { StatusFilter } from "./filters/StatusFilter";
import { ManagerFilter } from "./filters/ManagerFilter";
import { PaymentStatusFilter } from "./filters/PaymentStatusFilter";
import { DateRangeFilters } from "./filters/DateRangeFilters";
import { FilterActions } from "./filters/FilterActions";

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

export type OrderFilterValues = z.infer<typeof orderFilterSchema>;

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
          {/* Search filter */}
          <SearchFilter form={form} />

          {/* Order Type filter */}
          <OrderTypeFilter 
            form={form} 
            orderTypes={orderTypes} 
            isLoading={isLoading} 
            onOrderTypeChange={handleOrderTypeChange} 
          />

          {/* Current Status filter - only show if order type is selected */}
          <StatusFilter 
            form={form} 
            statuses={getAvailableStatuses()} 
            isLoading={isLoading} 
            selectedOrderType={selectedOrderType} 
          />

          {/* Assigned Manager filter */}
          <ManagerFilter 
            form={form} 
            managers={managers} 
            isLoading={isLoading} 
          />

          {/* Payment Status filter */}
          <PaymentStatusFilter 
            form={form} 
            paymentStatuses={paymentStatuses} 
            isLoading={isLoading} 
          />

          {/* Date Range filters */}
          <DateRangeFilters form={form} />
        </div>

        {/* Action buttons */}
        <FilterActions onResetFilters={handleResetFilters} />
      </form>
    </Form>
  );
};

export default OrderFilters;
