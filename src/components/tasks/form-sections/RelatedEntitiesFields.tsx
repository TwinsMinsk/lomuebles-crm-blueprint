
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import LeadSelector from "./related-entities/LeadSelector";
import ContactSelector from "./related-entities/ContactSelector";
import OrderSelector from "./related-entities/OrderSelector";
import PartnerSelector from "./related-entities/PartnerSelector";
import CustomRequestSelector from "./related-entities/CustomRequestSelector";
import SimplifiedLeadSelector from "./related-entities/SimplifiedLeadSelector";
import SimplifiedContactSelector from "./related-entities/SimplifiedContactSelector";
import SimplifiedOrderSelector from "./related-entities/SimplifiedOrderSelector";

const RelatedEntitiesFields: React.FC = () => {
  const { userRole } = useAuth();
  const { control } = useFormContext();
  
  const isSpecialist = userRole === 'Специалист';

  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-lg font-medium mb-4">Связанные объекты</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Use simplified selectors for specialists */}
        {isSpecialist ? (
          <>
            <SimplifiedLeadSelector />
            <SimplifiedContactSelector />
            <SimplifiedOrderSelector />
          </>
        ) : (
          <>
            <FormField
              control={control}
              name="related_lead_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Связанный лид</FormLabel>
                  <FormControl>
                    <LeadSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="related_contact_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Связанный контакт</FormLabel>
                  <FormControl>
                    <ContactSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="related_order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Связанный заказ</FormLabel>
                  <FormControl>
                    <OrderSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="related_partner_manufacturer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Связанный партнер</FormLabel>
                  <FormControl>
                    <PartnerSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="related_custom_request_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Связанный запрос</FormLabel>
                  <FormControl>
                    <CustomRequestSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RelatedEntitiesFields;
