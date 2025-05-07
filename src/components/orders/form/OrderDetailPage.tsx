
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrderForm } from "./OrderForm";
import PageHeader from "@/components/common/PageHeader";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderFormValues } from "./orderFormSchema";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const isEditMode = orderId !== "new";
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderFormValues | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!isEditMode) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("deals_orders")
          .select("*")
          .eq("deal_order_id", orderId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Transform the data to match our form schema
          setOrder({
            orderNumber: data.order_number,
            orderName: data.order_name,
            orderType: data.order_type,
            statusReadyMade: data.status_ready_made,
            statusCustomMade: data.status_custom_made,
            clientLanguage: data.client_language,
            associatedContactId: data.associated_contact_id,
            associatedCompanyId: data.associated_company_id,
            sourceLeadId: data.source_lead_id,
            assignedUserId: data.assigned_user_id,
            associatedPartnerManufacturerId: data.associated_partner_manufacturer_id,
            finalAmount: data.final_amount,
            paymentStatus: data.payment_status,
            deliveryAddressFull: data.delivery_address_full,
            notesHistory: data.notes_history,
            creatorUserId: data.creator_user_id,
            creationDate: data.creation_date,
            closingDate: data.closing_date
          });
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, isEditMode]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 p-4 rounded-md mb-4">
          <p className="text-destructive">Ошибка при загрузке заказа: {error}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => navigate("/orders")}
          >
            Вернуться к заказам
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={isEditMode ? "Редактирование заказа" : "Новый заказ"}
        description={isEditMode ? `Заказ № ${order?.orderNumber}` : "Создание нового заказа"}
        action={
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
          </Button>
        }
      />
      
      <OrderForm 
        orderId={isEditMode ? parseInt(orderId!) : undefined} 
        defaultValues={order || undefined}
        isEdit={isEditMode} 
      />
    </div>
  );
};

export default OrderDetailPage;
