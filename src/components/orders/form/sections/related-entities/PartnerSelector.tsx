
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import EntitySelector from "./EntitySelector";
import { EntityOption } from "./EntitySelector";

interface PartnerSelectorProps {
  form: UseFormReturn<OrderFormValues>;
  partners: EntityOption[];
  isLoading: boolean;
}

const PartnerSelector: React.FC<PartnerSelectorProps> = ({ form, partners, isLoading }) => {
  return (
    <EntitySelector
      form={form}
      fieldName="associatedPartnerManufacturerId"
      label="Партнер-изготовитель"
      options={partners}
      placeholder="Выберите партнера"
      emptyMessage="Партнер не найден."
      isLoading={isLoading}
    />
  );
};

export default PartnerSelector;
