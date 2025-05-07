
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";

// Define the OrderItem interface to match our database structure
interface OrderItem {
  order_item_id: number;
  product_name_from_tilda: string;
  sku_from_tilda: string | null;
  quantity: number;
  price_per_item_from_tilda: number;
  total_item_price: number;
  link_to_product_on_tilda: string | null;
  parent_deal_order_id: number;
}

interface OrderItemsSectionProps {
  form: UseFormReturn<OrderFormValues>;
  orderId?: number;
}

export const OrderItemsSection: React.FC<OrderItemsSectionProps> = ({ form, orderId }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customOrderDescription, setCustomOrderDescription] = useState<string>("");
  
  const orderType = form.watch("orderType");
  const isReadyMadeFurniture = orderType === "Готовая мебель (Tilda)";
  const isCustomMadeFurniture = orderType === "Мебель на заказ";
  
  // Fetch order items when component mounts or orderId changes
  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!orderId) {
        // Clear order items if no orderId (this is a new order)
        setOrderItems([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("*")
          .eq("parent_deal_order_id", orderId);
          
        if (error) throw error;
        
        setOrderItems(data || []);
        
        // Calculate and update the final amount
        if (data && data.length > 0) {
          const totalAmount = data.reduce((sum, item) => sum + (item.total_item_price || 0), 0);
          form.setValue("finalAmount", totalAmount);
        }
      } catch (err: any) {
        console.error("Error fetching order items:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderItems();
  }, [orderId, form]);
  
  // Handle custom order description change
  useEffect(() => {
    // When order type changes, update the custom description field based on notes_history
    if (isCustomMadeFurniture) {
      const notesHistory = form.getValues("notesHistory");
      setCustomOrderDescription(notesHistory || "");
    }
  }, [orderType, form]);
  
  const handleCustomDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCustomOrderDescription(value);
    // Also update the notesHistory field to keep them in sync for now
    form.setValue("notesHistory", value);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Позиции заказа</CardTitle>
        <CardDescription>
          {isReadyMadeFurniture 
            ? "Список товарных позиций из заказа Tilda (только для просмотра)" 
            : "Описание заказной мебели"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isReadyMadeFurniture && (
          <>
            {isLoading ? (
              // Show skeleton loading state
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : error ? (
              // Show error state
              <div className="text-red-500">{error}</div>
            ) : orderItems.length === 0 ? (
              // Show empty state
              <div className="text-center py-4 text-muted-foreground">
                Нет товарных позиций для этого заказа
              </div>
            ) : (
              // Show order items table
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название товара</TableHead>
                      <TableHead>Артикул</TableHead>
                      <TableHead className="text-right">Количество</TableHead>
                      <TableHead className="text-right">Цена за единицу</TableHead>
                      <TableHead className="text-right">Общая стоимость</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.order_item_id}>
                        <TableCell className="font-medium">{item.product_name_from_tilda}</TableCell>
                        <TableCell>{item.sku_from_tilda || "-"}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price_per_item_from_tilda)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.total_item_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total row */}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">
                        Итого:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(
                          orderItems.reduce((sum, item) => sum + (item.total_item_price || 0), 0)
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
        
        {/* For custom furniture orders, show a text area for now */}
        {isCustomMadeFurniture && (
          <div className="space-y-2">
            <label htmlFor="customOrderDescription" className="block font-medium">
              Описание заказной мебели
            </label>
            <Textarea
              id="customOrderDescription"
              value={customOrderDescription}
              onChange={handleCustomDescriptionChange}
              placeholder="Введите описание заказной мебели, список позиций и другие детали..."
              className="min-h-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Для заказной мебели пока используйте это поле для описания всех позиций заказа.
              В будущих версиях здесь будет более структурированное управление позициями.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
