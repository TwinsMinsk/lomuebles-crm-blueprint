
import React, { useState } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrderOption {
  id: number;
  order_number: string;
  order_name: string | null;
}

export interface TransactionOrderSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  orders: OrderOption[];
  isLoading: boolean;
}

const TransactionOrderSelector: React.FC<TransactionOrderSelectorProps> = ({
  value,
  onChange,
  orders,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter orders by search term
  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.order_name && order.order_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Find the selected order
  const selectedOrder = orders.find(order => order.id === value);

  return (
    <div className="space-y-2">
      {selectedOrder ? (
        <div className="flex items-center justify-between p-2 rounded border">
          <div>
            <div className="font-medium">{selectedOrder.order_number}</div>
            {selectedOrder.order_name && (
              <div className="text-sm text-muted-foreground">{selectedOrder.order_name}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Очистить
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск заказа..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="border rounded-md max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Загрузка...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                Заказы не найдены
              </div>
            ) : (
              <ul className="py-1">
                {filteredOrders.map((order) => (
                  <li
                    key={order.id}
                    className={cn(
                      "px-2 py-1.5 hover:bg-accent cursor-pointer flex items-center",
                      order.id === value && "bg-accent"
                    )}
                    onClick={() => {
                      console.log("Order selected:", order.id, typeof order.id);
                      onChange(Number(order.id));
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        order.id === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{order.order_number}</div>
                      {order.order_name && (
                        <div className="text-xs text-muted-foreground">{order.order_name}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionOrderSelector;
