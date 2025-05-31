
import React from "react";
import { useAuth } from "@/context/AuthContext";
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
            <LeadSelector />
            <ContactSelector />
            <OrderSelector />
            <PartnerSelector />
            <CustomRequestSelector />
          </>
        )}
      </div>
    </div>
  );
};

export default RelatedEntitiesFields;
