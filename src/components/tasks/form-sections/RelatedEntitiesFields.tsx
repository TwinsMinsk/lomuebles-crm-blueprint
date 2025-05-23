
import React from "react";
import { useFormContext } from "react-hook-form";
import LeadSelector from "./related-entities/LeadSelector";
import ContactSelector from "./related-entities/ContactSelector";
import OrderSelector from "./related-entities/OrderSelector";
import PartnerSelector from "./related-entities/PartnerSelector";
import CustomRequestSelector from "./related-entities/CustomRequestSelector";

const RelatedEntitiesFields: React.FC = () => {
  const { watch, setValue } = useFormContext();
  
  // Get current values from form
  const relatedOrderId = watch("related_order_id");
  const relatedLeadId = watch("related_lead_id");
  const relatedContactId = watch("related_contact_id");
  const relatedPartnerId = watch("related_partner_manufacturer_id");
  const relatedCustomRequestId = watch("related_custom_request_id");

  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-lg font-medium mb-4">Связанные объекты</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LeadSelector 
          value={relatedLeadId} 
          onChange={(value) => setValue("related_lead_id", value)} 
        />
        <ContactSelector 
          value={relatedContactId} 
          onChange={(value) => setValue("related_contact_id", value)} 
        />
        <OrderSelector 
          value={relatedOrderId} 
          onChange={(value) => setValue("related_order_id", value)} 
        />
        <PartnerSelector 
          value={relatedPartnerId} 
          onChange={(value) => setValue("related_partner_manufacturer_id", value)} 
        />
        <CustomRequestSelector 
          value={relatedCustomRequestId} 
          onChange={(value) => setValue("related_custom_request_id", value)} 
        />
      </div>
    </div>
  );
};

export default RelatedEntitiesFields;
