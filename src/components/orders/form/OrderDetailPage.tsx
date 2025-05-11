
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrderForm } from "./OrderForm";
import PageHeader from "@/components/common/PageHeader";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderFormValues } from "./orderFormSchema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const isEditMode = orderId !== "new" && orderId !== undefined;
  const navigate = useNavigate();
  
  // Parse orderId from string to number for database operations
  const orderIdNumber = isEditMode && orderId ? parseInt(orderId, 10) : undefined;
  
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
          .eq("deal_order_id", orderIdNumber)
          .single();
          
        if (error) throw error;
        
        if (data) {
          console.log("Fetched order data:", data);
          // Transform the data to match our form schema
          // Ensure attachedFilesOrderDocs is always initialized as an array
          const attachedFiles = Array.isArray(data.attached_files_order_docs) 
            ? data.attached_files_order_docs 
            : [];
            
          // Map the data safely, ensuring all fields are properly initialized
          setOrder({
            orderNumber: data.order_number || "",
            orderName: data.order_name || "",
            orderType: data.order_type || "Готовая мебель (Tilda)",
            statusReadyMade: data.status_ready_made || null,
            statusCustomMade: data.status_custom_made || null,
            clientLanguage: data.client_language || "ES",
            associatedContactId: data.associated_contact_id || null,
            associatedCompanyId: data.associated_company_id || null,
            sourceLeadId: data.source_lead_id || null,
            assignedUserId: data.assigned_user_id || null,
            associatedPartnerManufacturerId: data.associated_partner_manufacturer_id || null,
            finalAmount: data.final_amount || null,
            paymentStatus: data.payment_status || null,
            deliveryAddressFull: data.delivery_address_full || "",
            notesHistory: data.notes_history || "",
            attachedFilesOrderDocs: attachedFiles,
            creatorUserId: data.creator_user_id || null,
            creationDate: data.creation_date || null,
            closingDate: data.closing_date || null
          });
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message);
        toast.error(`Ошибка загрузки заказа: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, isEditMode, orderIdNumber]);
  
  // Add debug logs to help identify possible undefined values
  console.log("Order Detail Page state:", { 
    orderId, 
    isEditMode, 
    order,
    hasAttachedFiles: order?.attachedFilesOrderDocs ? true : false,
    attachedFilesType: order?.attachedFilesOrderDocs ? typeof order.attachedFilesOrderDocs : 'undefined',
    isLoading, 
    error 
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Загрузка данных заказа...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex flex-col">
            <span className="font-bold mb-2">Ошибка при загрузке заказа:</span> {error}
            <Button 
              variant="outline" 
              className="mt-4 self-start" 
              onClick={() => navigate("/orders")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к заказам
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Ensure we have proper default values for new orders
  const defaultOrderValues = isEditMode ? order : {
    orderType: "Готовая мебель (Tilda)",
    clientLanguage: "ES",
    // Explicitly initialize as empty array to avoid "not iterable" errors
    attachedFilesOrderDocs: [],
  };

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
        orderId={orderIdNumber} 
        defaultValues={defaultOrderValues}
        isEdit={isEditMode} 
      />
    </div>
  );
};

export default OrderDetailPage;
