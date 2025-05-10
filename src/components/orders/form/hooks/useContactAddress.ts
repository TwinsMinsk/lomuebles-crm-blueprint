
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { supabase } from "@/integrations/supabase/client";

export const useContactAddress = (form: UseFormReturn<OrderFormValues>) => {
  const associatedContactId = form.watch("associatedContactId");
  
  useEffect(() => {
    const fetchContactAddress = async () => {
      if (!associatedContactId) return;
      
      try {
        const { data: contact, error } = await supabase
          .from("contacts")
          .select(`
            delivery_address_street,
            delivery_address_number,
            delivery_address_apartment,
            delivery_address_city,
            delivery_address_postal_code,
            delivery_address_country
          `)
          .eq("contact_id", associatedContactId)
          .single();
          
        if (error) throw error;
        
        if (contact) {
          // Format full address from contact address fields
          const addressParts = [
            contact.delivery_address_street,
            contact.delivery_address_number && `№${contact.delivery_address_number}`,
            contact.delivery_address_apartment && `кв./офис ${contact.delivery_address_apartment}`,
            contact.delivery_address_city,
            contact.delivery_address_postal_code,
            contact.delivery_address_country
          ].filter(Boolean);
          
          const fullAddress = addressParts.join(', ');
          
          if (fullAddress && !form.getValues("deliveryAddressFull")) {
            form.setValue("deliveryAddressFull", fullAddress);
          }
        }
      } catch (error) {
        console.error("Error fetching contact address:", error);
      }
    };
    
    fetchContactAddress();
  }, [associatedContactId, form]);
};
