
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import EntitySelector from "./EntitySelector";
import { EntityOption } from "./EntitySelector";

interface LeadSelectorProps {
  form: UseFormReturn<OrderFormValues>;
  leads: EntityOption[];
  isLoading: boolean;
}

const LeadSelector: React.FC<LeadSelectorProps> = ({ form, leads = [], isLoading }) => {
  // Ensure leads is always an array
  const safeLeads = Array.isArray(leads) ? leads : [];
  
  return (
    <EntitySelector
      form={form}
      fieldName="sourceLeadId"
      label="Исходный лид"
      options={safeLeads}
      placeholder="Выберите лид"
      emptyMessage="Лид не найден."
      isLoading={isLoading}
    />
  );
};

export default LeadSelector;
